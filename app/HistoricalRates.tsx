import React, { useState, useEffect ,useCallback } from "react";
import { View, Text, ActivityIndicator, Button, StyleSheet } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import axios from "axios";
import { BACKEND_URL } from "../config";

type HistoricalRate = { effectiveDate: string; mid: number };
type Props = { currency: string };

export default function HistoricalRates({ currency }: Props) {
  const [historicalRates, setHistoricalRates] = useState<HistoricalRate[]>([]);
  const [startDate, setStartDate] = useState(new Date(Date.now() - 7*24*60*60*1000));
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
      const res = await axios.get(`${BACKEND_URL}/api/historical/${currency}/${start}/${end}`);
      setHistoricalRates(res.data);
    } catch (err) {
      console.error(err);
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
      <Button title={`Start Date: ${startDate.toISOString().split("T")[0]}`} onPress={() => setShowStartPicker(true)} />
      <Button title={`End Date: ${endDate.toISOString().split("T")[0]}`} onPress={() => setShowEndPicker(true)} />

      {showStartPicker && (
        <DateTimePicker value={startDate} mode="date" display="default" maximumDate={new Date()} onChange={(e, date) => { setShowStartPicker(false); if(date) setStartDate(date); }} />
      )}
      {showEndPicker && (
        <DateTimePicker value={endDate} mode="date" display="default" maximumDate={new Date()} onChange={(e, date) => { setShowEndPicker(false); if(date) setEndDate(date); }} />
      )}

      {loading ? <ActivityIndicator size="small" color="#fff" /> :
       historicalRates.length === 0 ? <Text style={{color:"#fff"}}>No historical data</Text> :
       historicalRates.map(r => <Text key={r.effectiveDate} style={{color:"#fff"}}>{r.effectiveDate}: {r.mid.toFixed(4)} PLN</Text>)}
    </View>
  );
}

const styles = StyleSheet.create({
  section: { marginVertical: 10, padding: 10, backgroundColor: "rgba(0,0,0,0.3)", borderRadius: 5 },
  label: { fontSize: 16, marginBottom: 5, color: "#fff" },
});
