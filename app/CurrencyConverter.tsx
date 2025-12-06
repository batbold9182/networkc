import React, { useState, useEffect } from "react";
import { View, Text, TextInput, StyleSheet, ActivityIndicator } from "react-native";
import { Picker } from "@react-native-picker/picker";
import axios from "axios";
import { BACKEND_URL } from "../config";

export type Rate = {
  currency: string;
  code: string;
  mid: number;
};

type Props = {
  token: string;
  selectedRate: Rate | null;
  onRateChange: (rate: Rate | null) => void;
  amount: string;
  onAmountChange: (value: string) => void;
  converted: number | null;
  setConverted: (value: number | null) => void;
};

export default function CurrencyConverter({
  token,
  selectedRate,
  onRateChange,
  amount,
  onAmountChange,
  converted,
  setConverted,
}: Props) {
  const [rates, setRates] = useState<Rate[]>([]);
  const [loadingRates, setLoadingRates] = useState(true);

  useEffect(() => {
    const fetchRates = async () => {
      try {
        const res = await axios.get<Rate[]>(`${BACKEND_URL}/api/rates`);
        setRates(res.data);
        onRateChange(res.data.find(r => r.code === "USD") || null);
      } catch (err) {
        console.error("Fetch rates error:", err);
      } finally {
        setLoadingRates(false);
      }
    };
    fetchRates();
  }, [onRateChange]);

  useEffect(() => {
    if (!selectedRate || !amount) return setConverted(null);
    const value = parseFloat(amount);
    setConverted(isNaN(value) ? null : value * selectedRate.mid);
  }, [amount, selectedRate,setConverted]);

  return (
    <View style={styles.section}>
      <Text style={styles.label}>Amount in PLN:</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter amount"
        placeholderTextColor="#999"
        keyboardType="numeric"
        value={amount}
        onChangeText={onAmountChange}
      />

      <Text style={styles.label}>Select currency:</Text>
      {loadingRates ? (
        <ActivityIndicator size="small" color="#fff" />
      ) : (
        <Picker
          selectedValue={selectedRate?.code}
          onValueChange={code => {
            const rate = rates.find(r => r.code === code) || null;
            onRateChange(rate);
          }}
          style={{ color: "#fff" }}
        >
          {rates.map(r => (
            <Picker.Item label={`${r.code} (${r.currency})`} value={r.code} key={r.code} />
          ))}
        </Picker>
      )}

      {converted !== null && selectedRate && (
        <Text style={styles.result}>
          {amount} PLN = {converted.toFixed(2)} {selectedRate.code}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  section: { marginVertical: 10, padding: 10, backgroundColor: "rgba(0,0,0,0.3)", borderRadius: 5 },
  label: { fontSize: 16, marginBottom: 5, color: "#fff" },
  input: { borderWidth: 1, borderColor: "#ccc", padding: 10, borderRadius: 5, color: "#000", backgroundColor: "rgba(255,255,255,0.85)" },
  result: { fontSize: 18, textAlign: "center", marginTop: 20, fontWeight: "bold", color: "#fff" },
});
