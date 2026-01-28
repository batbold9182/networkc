import React, { useState } from "react";
import { ImageBackground, ScrollView, Text } from "react-native";
import { useAuth } from "../../auth";
import { ConverterScreenStyles } from "../../styles/Styles";
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
      style={ConverterScreenStyles.Background}
      resizeMode="cover"
    >
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <Text style={ConverterScreenStyles.Text}>Currency Converter</Text>

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
