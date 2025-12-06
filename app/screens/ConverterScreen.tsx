import React, { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useAuth } from "../../auth";
import CurrencyConverter from "../CurrencyConverter";

export default function ConverterScreen() {
  const { token, user } = useAuth();
  const [amount, setAmount] = useState("");
  const [selectedRate, setSelectedRate] = useState<any | null>(null);
  const [converted, setConverted] = useState<number | null>(null);

  if (!token || !user) {
    return (
      <View style={styles.center}>
        <Text style={{color:'#fff'}}>Please login to use the converter</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CurrencyConverter
        token={token}
        selectedRate={selectedRate}
        onRateChange={setSelectedRate}
        amount={amount}
        onAmountChange={setAmount}
        converted={converted}
        setConverted={setConverted}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "transparent" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
});
