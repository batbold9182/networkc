import React, { useState } from "react";
import { ImageBackground, ScrollView, StyleSheet, Text } from "react-native";
import { useAuth } from "../../auth";
import CurrencyConverter, { Rate } from "../CurrencyConverter";

export default function ConverterScreen() {
  const { token } = useAuth();

  const [amount, setAmount] = useState("");
  const [inputCurrency, setInputCurrency] = useState<Rate | null>(null);
  const [selectedRate, setSelectedRate] = useState<Rate | null>(null);
  const [converted, setConverted] = useState<number | null>(null);

  return (
    <ImageBackground
      source={require("../../assets/images/screen-mobile.jpg")}
      style={styles.Background}
      resizeMode="cover"
    >
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <Text style={{ fontSize: 22, color: "#fff", marginBottom: 20 }}>
          Currency Converter
        </Text>

        <CurrencyConverter
          token={token}
          amount={amount}
          onAmountChange={setAmount}
          inputCurrency={inputCurrency}
          onInputCurrencyChange={setInputCurrency}
          selectedRate={selectedRate}
          onRateChange={setSelectedRate}
          converted={converted}
          onConvertedChange={setConverted}
        />
      </ScrollView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  Background: { flex: 1, width: "100%", height: "100%" },
});
