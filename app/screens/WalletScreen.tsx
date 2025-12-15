// WalletScreen.tsx
import { Picker } from "@react-native-picker/picker";
import axios from "axios";
import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import { ActivityIndicator, ImageBackground, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { useAuth } from "../../auth";
import { BACKEND_URL } from "../../config";


type Rate = {
  currency: string;
  code: string;
  mid: number;
};

export default function WalletScreen() {
  const { token, user, setUser } = useAuth();
  const router = useRouter();
  const [rates, setRates] = useState<Rate[]>([]);
  const [loadingRates, setLoadingRates] = useState(true);

  const [amount, setAmount] = useState("");
  const [inputCurrency, setInputCurrency] = useState<Rate | null>(null);
  const [targetCurrency, setTargetCurrency] = useState<Rate | null>(null);
  const [converted, setConverted] = useState<number | null>(null);
  const hasFetched = useRef(false);
  

  // Fetch rates from NBP API
  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;

    const fetchRates = async () => {
      try {
        const res = await axios.get<Rate[]>(`${BACKEND_URL}/api/rates`);
        const allRates = [{ code: "PLN", currency: "Polish Zloty", mid: 1 }, ...res.data];
        setRates(allRates);

        if (!inputCurrency) setInputCurrency(allRates.find(r => r.code === "PLN") || null);
        if (!targetCurrency) setTargetCurrency(allRates.find(r => r.code === "USD") || null);
      } catch (err) {
        console.error("Failed to fetch rates:", err);
      } finally {
        setLoadingRates(false);
      }
    };
    fetchRates();
  }, [inputCurrency, targetCurrency]);

  // Compute conversion
  useEffect(() => {
    if (!inputCurrency || !targetCurrency || !amount) {
      setConverted(null);
      return;
    }
    const value = parseFloat(amount);
    if (isNaN(value)) return setConverted(null);

    const amountInPLN = inputCurrency.code === "PLN" ? value : value * inputCurrency.mid;
    const result = targetCurrency.code === "PLN" ? amountInPLN : amountInPLN / targetCurrency.mid;
    setConverted(result);
  }, [amount, inputCurrency, targetCurrency]);

  const buyCurrency = async () => {
  if (!inputCurrency || !targetCurrency || !amount) {
    return alert("Please select currencies and enter amount.");
  }
  const amountNum = parseFloat(amount);
  if (isNaN(amountNum) || amountNum <= 0) return alert("Invalid amount.");

  const targetRate = targetCurrency.code === "PLN" ? 1 : targetCurrency.mid;

  try {
    const res = await axios.post(
      `${BACKEND_URL}/api/transaction/buy`,
      {
        amount: amountNum,
        inputCode: inputCurrency.code,
        targetCode: targetCurrency.code,
        rate: targetRate, // <-- use targetRate here
      },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    setUser(res.data.user);
    setAmount("");
    alert("Currency bought successfully!");
  } catch (err: any) {
    console.error(err);
    alert(err.response?.data?.message || "Buy failed");
  }
};

  return (
    <ImageBackground
      source={require("../../assets/images/screen-mobile.jpg")}
      style={styles.Background}
      resizeMode="cover"
    >
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Wallet</Text>    

        {user && (
          <View style={{ marginBottom: 20 }}>
            <Text style={styles.info}>PLN Balance: {user.balance}</Text>
            {user.wallet?.map(w => (
              <Text key={w.code} style={styles.info}>
                {w.code}: {w.amount.toFixed(2)}
              </Text>
            ))}
          </View>
        )}

        {/* Amount */}
        <Text style={styles.label}>Amount:</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter amount"
          placeholderTextColor="#999"
          keyboardType="numeric"
          value={amount}
          onChangeText={setAmount}
        />

        {/* Input Currency */}
        <Text style={styles.label}>Input Currency:</Text>
        {loadingRates ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <Picker
            selectedValue={inputCurrency?.code}
            onValueChange={code => setInputCurrency(rates.find(r => r.code === code) || null)}
            style={{ color: "#000000ff" }}
          >
            {rates.map(r => (
              <Picker.Item key={r.code} label={`${r.code} (${r.currency})`} value={r.code} />
            ))}
          </Picker>
        )}

        {/* Target Currency */}
        <Text style={styles.label}>Target Currency:</Text>
        {loadingRates ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <Picker
            selectedValue={targetCurrency?.code}
            onValueChange={code => setTargetCurrency(rates.find(r => r.code === code) || null)}
            style={{ color: "#000000ff" }}
          >
            {rates.map(r => (
              <Picker.Item key={r.code} label={`${r.code} (${r.currency})`} value={r.code} />
            ))}
          </Picker>
        )}

        {/* Conversion Result */}
        {converted !== null && (
          <Text style={styles.result}>
            {amount} {inputCurrency?.code} = {converted.toFixed(2)} {targetCurrency?.code}
          </Text>
        )}

        {/* Buy Button */}
        <Text style={styles.buyButton} onPress={buyCurrency}>
          Buy Currency
        </Text>

        {/* Go to Transactions Screen */}
        <Text
          style={styles.historyButton}
          onPress={() => router.push("/screens/FundingScreen")}
        >
          Deposit and withdraw funds
        </Text>
      </ScrollView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 20, justifyContent: "center" },
  title: { fontSize: 26, textAlign: "center", color: "#fff", marginBottom: 10, fontWeight: "bold" },
  info: { fontSize: 18, textAlign: "center", marginBottom: 5, color: "#fff" },
  label: { fontSize: 16, marginTop: 10, marginBottom: 5, color: "#fff" },
  input: { borderWidth: 1, borderColor: "#ccc", padding: 10, borderRadius: 5, color: "#000", backgroundColor: "rgba(255,255,255,0.85)" },
  result: { fontSize: 18, textAlign: "center", marginTop: 15, fontWeight: "bold", color: "#fff" },
  buyButton: { marginTop: 20, padding: 15, backgroundColor: "#00cc44", borderRadius: 40, textAlign: "center", color: "#fff", fontSize: 18, fontWeight: "bold" },
  historyButton: { marginTop: 15, padding: 12, borderRadius: 30, textAlign: "center", color: "#fff", fontSize: 16, borderWidth: 1, borderColor: "#fff" },
  Background:{ flex: 1 ,width: '100%', height: '100%' },
});
