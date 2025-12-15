import axios from "axios";
import React, { useState } from "react";
import { ImageBackground, StyleSheet, Text, TextInput, View } from "react-native";
import { useAuth } from "../../auth";
import { BACKEND_URL } from "../../config";
import AccountFunding from "../AccountFunding";

export default function FundingScreen() {
  const { token, user, setUser } = useAuth();
  const [withdrawAmount, setWithdrawAmount] = useState("");

  if (!token || !user) {
    return (
      <View style={styles.center}>
        <Text style={{color:'#fff'}}>Please login to fund account</Text>
      </View>
    );
  }

  return (
    <ImageBackground
      source={require("../../assets/images/screen-mobile.jpg")}
      style={styles.Background}
      resizeMode="cover"
    >
   <View style={styles.container}>
        <View style={styles.balanceRow}>
          <Text style={styles.balanceLabel}>PLN Balance:</Text>
          <Text style={styles.balanceValue}>{user.balance}</Text>
        </View>
      <AccountFunding
        token={token}
        onBalanceUpdate={(newBalance) => setUser({ ...user, balance: newBalance })}
      />

      <View style={styles.section}>
        <Text style={styles.label}>Withdraw PLN:</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter amount"
          keyboardType="numeric"
          placeholderTextColor="#999"
          value={withdrawAmount}
          onChangeText={setWithdrawAmount}
        />
        <Text style={styles.button} onPress={async () => {
          const amt = parseFloat(withdrawAmount);
          if (!amt || amt <= 0) return alert("Please enter a valid amount");
          try {
            const res = await axios.post(`${BACKEND_URL}/api/user/withdraw`, { amount: amt }, {
              headers: { Authorization: `Bearer ${token}` },
            });
            setUser({ ...user, balance: res.data.balance });
            setWithdrawAmount("");
            alert(`Withdrawn ${amt} PLN. New balance: ${res.data.balance} PLN`);
          } catch (err: any) {
            console.error(err);
            alert(err.response?.data?.message || "Withdraw failed");
          }
        }}>
          Withdraw
        </Text>
      </View>
    </View> 
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "transparent" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  balanceRow: { flexDirection: "row", justifyContent: "center", alignItems: "center", marginBottom: 10 },
  balanceLabel: { color: "#fff", fontSize: 18, fontWeight: "600" },
  balanceValue: { color: "#66ffa0ff", fontSize: 20, fontWeight: "700" },
  section: { marginTop: 20, padding: 10, backgroundColor: "rgba(0,0,0,0.3)", borderRadius: 5 },
  label: { fontSize: 16, marginBottom: 5, color: "#fff" },
  input: { borderWidth: 1, borderColor: "#ccc", padding: 10, borderRadius: 5, color: "#000", backgroundColor: "rgba(255,255,255,0.85)" },
  button: { color: "#fff", marginTop: 10, padding: 12, backgroundColor: "#cc3344", borderRadius: 50, textAlign: "center", fontSize: 16, fontWeight: "bold" },
  Background: { flex: 1 ,width: '100%', height: '100%'},
});
