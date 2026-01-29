import axios from "axios";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Button,
  Platform,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { BACKEND_URL } from "../config";

// Only import DateTimePicker on native platforms
let DateTimePicker: any = null;
if (Platform.OS !== "web") {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  DateTimePicker = require("@react-native-community/datetimepicker").default;
}

// Web-compatible date input component using native HTML date picker
const WebDateInput = ({
  value,
  onChange,
  max,
}: {
  value: Date;
  onChange: (date: Date) => void;
  max: string;
}) => {
  if (Platform.OS !== "web") return null;

  return (
    <input
      type="date"
      value={value.toISOString().split("T")[0]}
      max={max}
      onChange={(e: any) => {
        const date = new Date(e.target.value);
        if (!isNaN(date.getTime())) {
          onChange(date);
        }
      }}
      style={{
        backgroundColor: "#fff",
        padding: 8,
        borderRadius: 5,
        minWidth: 150,
        fontSize: 14,
        border: "1px solid #ccc",
        cursor: "pointer",
      }}
    />
  );
};

type HistoricalRate = { effectiveDate: string; mid: number };
type Props = { currency: string };

export default function HistoricalRates({ currency }: Props) {
  const [historicalRates, setHistoricalRates] = useState<HistoricalRate[]>([]);
  const [startDate, setStartDate] = useState(
    new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
  );
  const [endDate, setEndDate] = useState(new Date());
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [loading, setLoading] = useState(false);

  const fetchHistoricalRates = useCallback(async () => {
    if (!currency) return;
    setLoading(true);
    const start = startDate.toISOString().split("T")[0];
    const end = endDate.toISOString().split("T")[0];

    try {
      const res = await axios.get(
        `${BACKEND_URL}/api/historical/${currency}/${start}/${end}`,
      );
      setHistoricalRates(res.data);
    } catch {
      setHistoricalRates([]);
    } finally {
      setLoading(false);
    }
  }, [currency, startDate, endDate]);

  useEffect(() => {
    fetchHistoricalRates();
  }, [fetchHistoricalRates]);

  return (
    <View style={styles.section}>
      <Text style={styles.label}>Historical Rates:</Text>

      {Platform.OS === "web" ? (
        <View style={styles.dateContainer}>
          <View style={styles.dateRow}>
            <Text style={styles.dateLabel}>Start Date:</Text>
            <WebDateInput
              value={startDate}
              onChange={setStartDate}
              max={new Date().toISOString().split("T")[0]}
            />
          </View>
          <View style={styles.dateRow}>
            <Text style={styles.dateLabel}>End Date:</Text>
            <WebDateInput
              value={endDate}
              onChange={setEndDate}
              max={new Date().toISOString().split("T")[0]}
            />
          </View>
        </View>
      ) : (
        <>
          <Button
            title={`Start Date: ${startDate.toISOString().split("T")[0]}`}
            onPress={() => setShowStartPicker(true)}
          />
          <Button
            title={`End Date: ${endDate.toISOString().split("T")[0]}`}
            onPress={() => setShowEndPicker(true)}
          />
        </>
      )}

      {Platform.OS !== "web" && showStartPicker && DateTimePicker && (
        <DateTimePicker
          value={startDate}
          mode="date"
          display="default"
          maximumDate={new Date()}
          onChange={(e: any, date?: Date) => {
            setShowStartPicker(false);
            if (date) setStartDate(date);
          }}
        />
      )}

      {Platform.OS !== "web" && showEndPicker && DateTimePicker && (
        <DateTimePicker
          value={endDate}
          mode="date"
          display="default"
          maximumDate={new Date()}
          onChange={(e: any, date?: Date) => {
            setShowEndPicker(false);
            if (date) setEndDate(date);
          }}
        />
      )}

      {loading ? (
        <ActivityIndicator size="small" color="#fff" />
      ) : historicalRates.length === 0 ? (
        <Text style={{ color: "#fff" }}>No historical data</Text>
      ) : (
        historicalRates.map((r) => (
          <Text key={r.effectiveDate} style={{ color: "#fff" }}>
            {r.effectiveDate}: {r.mid.toFixed(4)} PLN
          </Text>
        ))
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginVertical: 10,
    padding: 10,
    backgroundColor: "rgba(0,0,0,0.3)",
    borderRadius: 5,
  },
  label: { fontSize: 16, marginBottom: 5, color: "#fff" },
  dateContainer: { marginVertical: 10 },
  dateRow: { flexDirection: "row", alignItems: "center", marginVertical: 5 },
  dateLabel: { color: "#fff", marginRight: 10, width: 80 },
  dateInput: {
    backgroundColor: "#fff",
    padding: 8,
    borderRadius: 5,
    minWidth: 150,
    color: "#000",
  },
});
