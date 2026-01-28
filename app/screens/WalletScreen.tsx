// WalletScreen.tsx
import { Picker } from "@react-native-picker/picker";
import axios from "axios";
import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  ImageBackground,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { useAuth } from "../../auth";
import { BACKEND_URL } from "../../config";
//  WalletScreenStyles as styles can import like this noted XD
import { sellCurrency } from "../../api";
import { WalletScreenStyles as styles } from "../../styles/Styles";

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

  const [sellAmount, setSellAmount] = useState("");
  const [sellCurrencyCode, setSellCurrencyCode] = useState<string>(""); // renamed
  const [sellLoading, setSellLoading] = useState(false);
  // Fetch rates from NBP API
  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;

    const fetchRates = async () => {
      try {
        const res = await axios.get<Rate[]>(`${BACKEND_URL}/api/rates`);
        const allRates = [
          { code: "PLN", currency: "Polish Zloty", mid: 1 },
          ...res.data,
        ];
        setRates(allRates);

        if (!inputCurrency)
          setInputCurrency(allRates.find((r) => r.code === "PLN") || null);
        if (!targetCurrency)
          setTargetCurrency(allRates.find((r) => r.code === "USD") || null);
      } catch {
        // Failed to fetch rates
      } finally {
        setLoadingRates(false);
      }
    };
    fetchRates();
  }, [inputCurrency, targetCurrency]);

  useEffect(() => {
    if (user?.wallet?.length && !sellCurrencyCode) {
      setSellCurrencyCode(user.wallet[0].code);
    }
  }, [user?.wallet, sellCurrencyCode]);

  // Compute conversion
  useEffect(() => {
    if (!inputCurrency || !targetCurrency || !amount) {
      setConverted(null);
      return;
    }
    const value = parseFloat(amount);
    if (isNaN(value)) return setConverted(null);

    const amountInPLN =
      inputCurrency.code === "PLN" ? value : value * inputCurrency.mid;
    const result =
      targetCurrency.code === "PLN"
        ? amountInPLN
        : amountInPLN / targetCurrency.mid;
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
        { headers: { Authorization: `Bearer ${token}` } },
      );

      setUser(res.data.user);
      setAmount("");
      alert("Currency bought successfully!");
    } catch (err: any) {
      alert(err.response?.data?.message || "Buy failed");
    }
  };

  const handleSellCurrency = async () => {
    if (!sellCurrencyCode || !sellAmount) {
      return alert("Please select currency and enter amount to sell.");
    }
    const amountNum = parseFloat(sellAmount);
    if (isNaN(amountNum) || amountNum <= 0) return alert("Invalid amount.");

    const rate = rates.find((r) => r.code === sellCurrencyCode)?.mid;
    if (!rate) return alert("Invalid currency selected.");

    // Check wallet balance before API call
    const walletEntry = user?.wallet?.find((w) => w.code === sellCurrencyCode);
    if (!walletEntry || walletEntry.amount < amountNum) {
      return alert(`Insufficient ${sellCurrencyCode} balance.`);
    }

    setSellLoading(true);
    try {
      // Correct parameter order: token, amountForeign, rate, code
      const res = await sellCurrency(token!, amountNum, rate, sellCurrencyCode);
      if (res.message === "Sell successful") {
        setUser(res.user);
        setSellAmount("");
        alert(
          `Sold ${amountNum} ${sellCurrencyCode} for ${res.receivedPLN.toFixed(2)} PLN`,
        );
      } else {
        alert(res.message || "Sell failed");
      }
    } catch {
      alert("Sell failed due to an error.");
    } finally {
      setSellLoading(false);
    }
  };

  const getSellEstimate = () => {
    const amountNum = parseFloat(sellAmount);
    const rate = rates.find((r) => r.code === sellCurrencyCode)?.mid;
    if (!isNaN(amountNum) && rate && amountNum > 0) {
      return (amountNum * rate).toFixed(2);
    }
    return null;
  };
  return (
    <ImageBackground
      source={require("../../assets/images/screen-mobile.jpg")}
      style={styles.Background}
      resizeMode="cover"
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.title}>Wallet</Text>

        {user && (
          <View style={{ marginBottom: 20 }}>
            <Text style={styles.info}>PLN Balance: {user.balance}</Text>
            {user.wallet?.map((w) => (
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
            onValueChange={(code) =>
              setInputCurrency(rates.find((r) => r.code === code) || null)
            }
            style={{ color: "#000000ff" }}
          >
            {rates.map((r) => (
              <Picker.Item
                key={r.code}
                label={`${r.code} (${r.currency})`}
                value={r.code}
              />
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
            onValueChange={(code) =>
              setTargetCurrency(rates.find((r) => r.code === code) || null)
            }
            style={{ color: "#000000ff" }}
          >
            {rates.map((r) => (
              <Picker.Item
                key={r.code}
                label={`${r.code} (${r.currency})`}
                value={r.code}
              />
            ))}
          </Picker>
        )}

        {/* Conversion Result */}
        {converted !== null && (
          <Text style={styles.result}>
            {amount} {inputCurrency?.code} = {converted.toFixed(2)}{" "}
            {targetCurrency?.code}
          </Text>
        )}

        {/* Buy Button */}
        <Text style={styles.buyButton} onPress={buyCurrency}>
          Buy Currency
        </Text>
        {/* ===== SELL SECTION ===== */}
        <View style={{ marginTop: 30 }}>
          <Text style={[styles.label, { fontWeight: "bold", fontSize: 18 }]}>
            Sell Currency → PLN
          </Text>

          {user?.wallet?.length ? (
            <>
              <Text style={styles.label}>Select Currency to Sell:</Text>
              <Picker
                selectedValue={sellCurrencyCode}
                onValueChange={(code) => setSellCurrencyCode(code)}
                style={{ color: "#000000ff" }}
              >
                {user.wallet.map((w) => (
                  <Picker.Item
                    key={w.code}
                    label={`${w.code} (Balance: ${w.amount.toFixed(2)})`}
                    value={w.code}
                  />
                ))}
              </Picker>

              <Text style={styles.label}>Amount to Sell:</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter amount"
                placeholderTextColor="#999"
                keyboardType="numeric"
                value={sellAmount}
                onChangeText={setSellAmount}
              />

              {getSellEstimate() && (
                <Text style={styles.result}>
                  You will receive ~{getSellEstimate()} PLN
                </Text>
              )}

              <Text
                style={[styles.buyButton, { backgroundColor: "#e74c3c" }]}
                onPress={handleSellCurrency}
              >
                {sellLoading ? "Selling..." : "Sell Currency"}
              </Text>
            </>
          ) : (
            <Text style={styles.info}>No currencies in wallet to sell.</Text>
          )}
        </View>

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
