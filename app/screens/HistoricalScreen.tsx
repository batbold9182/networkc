import DateTimePicker from "@react-native-community/datetimepicker";
import axios from "axios";
import { useLocalSearchParams } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Button, StyleSheet, Text, View } from "react-native";
import { BACKEND_URL } from "../../config";

type HistoricalRate = {
  effectiveDate: string;
  mid: number;
};

type Props = {
  currency?: string;
};

export default function HistoricalScreen(props: Props) {
  const { currency: propCurrency } = props;
  const { currency: paramCurrency } = useLocalSearchParams();
  const currency = (propCurrency as string) || (paramCurrency as string) || "";
  const [historicalRates, setHistoricalRates] = useState<HistoricalRate[]>([]);
  const [startDate, setStartDate] = useState(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000));
  const [endDate, setEndDate] = useState(new Date());
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [loading, setLoading] = useState(false);

  // Stable fetch function
  const fetchHistoricalRates = useCallback(async () => {
    if (!currency) return;
    setLoading(true);

    const start = startDate.toISOString().split("T")[0];
    const end = endDate.toISOString().split("T")[0];

    try {
      const res = await axios.get(`${BACKEND_URL}/api/historical/${currency}/${start}/${end}`);
      setHistoricalRates(res.data);
    } catch (err) {
      console.error("Failed to fetch historical rates:", err);
      setHistoricalRates([]);
    } finally {
      setLoading(false);
    }
  }, [currency, startDate, endDate]);

  // Trigger fetch when currency or dates change
  useEffect(() => {
    fetchHistoricalRates();
  }, [fetchHistoricalRates, currency]);

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Historical Rates for {currency}:</Text>

      <Button
        title={`Start Date: ${startDate.toISOString().split("T")[0]}`}
        onPress={() => setShowStartPicker(true)}
      />
      <Button
        title={`End Date: ${endDate.toISOString().split("T")[0]}`}
        onPress={() => setShowEndPicker(true)}
      />

      {showStartPicker && (
        <DateTimePicker
          value={startDate}
          mode="date"
          display="default"
          maximumDate={new Date()}
          onChange={(e, date) => {
            setShowStartPicker(false);
            if (date) setStartDate(date);
          }}
        />
      )}

      {showEndPicker && (
        <DateTimePicker
          value={endDate}
          mode="date"
          display="default"
          maximumDate={new Date()}
          onChange={(e, date) => {
            setShowEndPicker(false);
            if (date) setEndDate(date);
          }}
        />
      )}

      {loading ? (
        <ActivityIndicator size="small" color="#fff" />
      ) : historicalRates.length === 0 ? (
        <Text style={styles.noData}>No historical data</Text>
      ) : (
        historicalRates.map((rate) => (
          <Text key={rate.effectiveDate} style={styles.rateText}>
            {rate.effectiveDate}: {rate.mid.toFixed(4)} PLN
          </Text>
        ))
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 10,
    padding: 10,
    backgroundColor: "rgba(0,0,0,0.3)",
    borderRadius: 5,
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
    color: "#fff",
    fontWeight: "bold",
  },
  rateText: { color: "#fff", marginVertical: 2 },
  noData: { color: "#fff", fontStyle: "italic" },
});
