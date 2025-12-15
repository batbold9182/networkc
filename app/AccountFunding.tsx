import React, { useState } from "react";
import { View, Text, TextInput, StyleSheet } from "react-native";
import axios from "axios";
import { BACKEND_URL } from "../config";

type Props = {
  token: string;
  onBalanceUpdate: (newBalance: number) => void;
};

export default function AccountFunding({ token, onBalanceUpdate }: Props) {
  const [fundAmount, setFundAmount] = useState("");

  const handleFund = async () => {
    const amount = parseFloat(fundAmount);
    if (!amount || amount <= 0) {
      alert("Please enter a valid amount");
      return;
    }

    try {
      const res = await axios.post(
        `${BACKEND_URL}/api/user/fund`,
        { amount },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert(`Success! New balance: ${res.data.balance} PLN`);
      setFundAmount("");
      onBalanceUpdate(res.data.balance); 
    } catch (err) {
      console.error(err);
      alert("Failed to fund account");
    }
  };

  return (
    <View style={styles.section}>
      <Text style={styles.label}>Fund Account (PLN):</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter amount"
        placeholderTextColor="#999"
        keyboardType="numeric"
        value={fundAmount}
        onChangeText={setFundAmount}
      />
      <Text style={styles.button} onPress={handleFund}>
        Add Funds
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  section: { marginVertical: 10, padding: 10, backgroundColor: "rgba(0,0,0,0.3)", borderRadius: 5 },
  label: { fontSize: 16, marginBottom: 5, color: "#fff" },
  input: { borderWidth: 1, borderColor: "#ccc", padding: 10, borderRadius: 5, color: "#000", backgroundColor: "rgba(255,255,255,0.85)" },
  button: { color: "#fff", marginTop: 10, padding: 15, backgroundColor: "#00cc44", borderRadius: 50, textAlign: "center", fontSize: 16, fontWeight: "bold" },
});
