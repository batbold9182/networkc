import DateTimePicker from "@react-native-community/datetimepicker";
import { Picker } from "@react-native-picker/picker";
import axios from "axios";
import { useLocalSearchParams } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { ActivityIndicator, Button, ImageBackground, ScrollView, Text, View } from "react-native";
import { BACKEND_URL } from "../../config";
import { HistoricalScreenStyles } from "./Styles";
type HistoricalRate = {
  effectiveDate: string;
  mid: number;
};
type Rate = { currency: string; code: string; mid: number };

type Props = {
  currency?: string;
};

export default function HistoricalScreen(props: Props) {
  const { currency: propCurrency } = props;
  const { currency: paramCurrency } = useLocalSearchParams();
  const initialCurrency = (propCurrency as string) || (paramCurrency as string) || "USD";
  const [selectedCurrency, setSelectedCurrency] = useState<string>(initialCurrency);
  const [rates, setRates] = useState<Rate[]>([]);
  const [loadingRates, setLoadingRates] = useState<boolean>(false);
  const fetchedRates = useRef(false);
  const [historicalRates, setHistoricalRates] = useState<HistoricalRate[]>([]);
  const [startDate, setStartDate] = useState(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000));
  const [endDate, setEndDate] = useState(new Date());
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [loading, setLoading] = useState(false);

  // Stable fetch function
  const fetchHistoricalRates = useCallback(async () => {
    if (!selectedCurrency) return;
    setLoading(true);

    const start = startDate.toISOString().split("T")[0];
    const end = endDate.toISOString().split("T")[0];

    try {
      const res = await axios.get(`${BACKEND_URL}/api/historical/${selectedCurrency}/${start}/${end}`);
      setHistoricalRates(res.data);
    } catch (err) {
      console.error("Failed to fetch historical rates:", err);
      setHistoricalRates([]);
    } finally {
      setLoading(false);
    }
  }, [selectedCurrency, startDate, endDate]);

  // Trigger fetch when currency or dates change
  useEffect(() => {
    fetchHistoricalRates();
  }, [fetchHistoricalRates]);

  // Load available currencies for picker
  useEffect(() => {
    if (fetchedRates.current) return;
    fetchedRates.current = true;
    (async () => {
      try {
        setLoadingRates(true);
        const res = await axios.get<Rate[]>(`${BACKEND_URL}/api/rates`);
        const all = [{ code: "PLN", currency: "Polish Zloty", mid: 1 }, ...res.data];
        setRates(all);
        // Ensure selected currency exists
        const exists = all.some(r => r.code === initialCurrency);
        if (!exists) setSelectedCurrency("USD");
      } catch (e) {
        console.error("Failed to load rates for picker", e);
      } finally {
        setLoadingRates(false);
      }
    })();
  }, [initialCurrency]);

  return (
    <ImageBackground
      source={require("../../assets/images/screen-mobile.jpg")}
      style={HistoricalScreenStyles.Background}
      resizeMode="cover"
    >
      <ScrollView contentContainerStyle={{ padding: 10 }}>
        <View style={HistoricalScreenStyles.container}>
          <Text style={HistoricalScreenStyles.label}>Historical Rates</Text>

          {/* Currency Picker */}
          {loadingRates ? (
            <ActivityIndicator size="small" color="#000000ff" />
          ) : (
            <Picker
              selectedValue={selectedCurrency}
              onValueChange={(c) => setSelectedCurrency(c)}
              style={{ color: "#000000ff" }}
            >
              {rates.map((r) => (
                <Picker.Item key={r.code} label={`${r.code} (${r.currency})`} value={r.code} />
              ))}
            </Picker>
          )}

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
            <Text style={HistoricalScreenStyles.noData}>No historical data</Text>
          ) : (
            historicalRates.map((rate) => (
              <Text key={rate.effectiveDate} style={HistoricalScreenStyles.rateText}>
                {rate.effectiveDate}: {rate.mid.toFixed(4)} PLN
              </Text>
            ))
          )}
        </View>
      </ScrollView>
    </ImageBackground>
  );
}


