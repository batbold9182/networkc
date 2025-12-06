import { Picker } from "@react-native-picker/picker";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, TextInput, View } from "react-native";
import { BACKEND_URL } from "../config";

export type Rate = {
  currency: string;
  code: string;
  mid: number;
};

type Props = {
  token: string | null;
  amount: string;
  onAmountChange: (amount: string) => void;
  inputCurrency: Rate | null;
  onInputCurrencyChange: (rate: Rate | null) => void;
  selectedRate: Rate | null;
  onRateChange: (rate: Rate | null) => void;
  converted: number | null;
  onConvertedChange: (value: number | null) => void;
};

export default function CurrencyConverter({
  amount,
  onAmountChange,
  inputCurrency,
  onInputCurrencyChange,
  selectedRate,
  onRateChange,
  converted,
  onConvertedChange,
}: Props) {
  const [rates, setRates] = useState<Rate[]>([]);
  const [loadingRates, setLoadingRates] = useState(true);

  useEffect(() => {
    const fetchRates = async () => {
      try {
        const res = await axios.get<Rate[]>(`${BACKEND_URL}/api/rates`);
        const allRates = [
          { code: "PLN", currency: "Polish Zloty", mid: 1 },
          ...res.data,
        ];

        setRates(allRates);

        const plnRate = allRates.find((r) => r.code === "PLN") || null;
        const usdRate = allRates.find((r) => r.code === "USD") || null;

        // >>>>>>> FIX: push defaults to parent
        if (!inputCurrency) onInputCurrencyChange(plnRate);
        if (!selectedRate) onRateChange(usdRate);
      } catch (err) {
        console.error("Failed to fetch rates:", err);
      } finally {
        setLoadingRates(false);
      }
    };

    fetchRates();
  }, []);

  useEffect(() => {
    if (!inputCurrency || !selectedRate || !amount) {
      onConvertedChange(null);
      return;
    }

    const value = parseFloat(amount);
    if (isNaN(value)) return onConvertedChange(null);

    const amountInPLN =
      inputCurrency.code === "PLN" ? value : value / inputCurrency.mid;

    const result =
      selectedRate.code === "PLN" ? amountInPLN : amountInPLN / selectedRate.mid;

    onConvertedChange(result);
  }, [amount, inputCurrency, selectedRate]);

  return (
    <View style={styles.section}>
      <Text style={styles.label}>Amount:</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter amount"
        value={amount}
        onChangeText={onAmountChange}
        keyboardType="numeric"
      />

      <Text style={styles.label}>Input Currency:</Text>
      {loadingRates ? (
        <ActivityIndicator size="small" color="#fff" />
      ) : (
        <Picker
          selectedValue={inputCurrency?.code}
          onValueChange={(c) =>
            onInputCurrencyChange(rates.find((r) => r.code === c) || null)
          }
          style={{ color: "#fff" }}
        >
          {rates.map((r) => (
            <Picker.Item
              label={`${r.code} (${r.currency})`}
              value={r.code}
              key={r.code}
            />
          ))}
        </Picker>
      )}

      <Text style={styles.label}>Target Currency:</Text>
      {loadingRates ? (
        <ActivityIndicator size="small" color="#fff" />
      ) : (
        <Picker
          selectedValue={selectedRate?.code}
          onValueChange={(c) =>
            onRateChange(rates.find((r) => r.code === c) || null)
          }
          style={{ color: "#fff" }}
        >
          {rates.map((r) => (
            <Picker.Item
              label={`${r.code} (${r.currency})`}
              value={r.code}
              key={r.code}
            />
          ))}
        </Picker>
      )}

      {converted !== null && (
        <Text style={styles.result}>
          {amount} {inputCurrency?.code} ={" "}
          {converted.toFixed(2)} {selectedRate?.code}
        </Text>
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
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    borderRadius: 5,
    backgroundColor: "#fff",
    color: "#000",
  },
  result: {
    fontSize: 18,
    textAlign: "center",
    marginTop: 20,
    fontWeight: "bold",
    color: "#fff",
  },
});
