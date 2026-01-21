import axios from "axios";
import React, { useState } from "react";
import { ImageBackground, Text, TextInput, View } from "react-native";
import { useAuth } from "../../auth";
import { BACKEND_URL } from "../../config";
import AccountFunding from "../AccountFunding";
import { FundingScreenStyle } from "./Styles";
export default function FundingScreen() {
  const { token, user, setUser } = useAuth();
  const [withdrawAmount, setWithdrawAmount] = useState("");

  if (!token || !user) {
    return (
      <View style={FundingScreenStyle.center}>
        <Text style={{color:'#fff'}}>Please login to fund account</Text>
      </View>
    );
  }

  return (
    <ImageBackground
      source={require("../../assets/images/screen-mobile.jpg")}
      style={FundingScreenStyle.Background}
      resizeMode="cover"
    >
   <View style={FundingScreenStyle.container}>
        <View style={FundingScreenStyle.balanceRow}>
          <Text style={FundingScreenStyle.balanceLabel}>PLN Balance:</Text>
          <Text style={FundingScreenStyle.balanceValue}>{user.balance}</Text>
        </View>
      <AccountFunding
        token={token}
        onBalanceUpdate={(newBalance) => setUser({ ...user, balance: newBalance })}
      />

      <View style={FundingScreenStyle.section}>
        <Text style={FundingScreenStyle.label}>Withdraw PLN:</Text>
        <TextInput
          style={FundingScreenStyle.input}
          placeholder="Enter amount"
          keyboardType="numeric"
          placeholderTextColor="#999"
          value={withdrawAmount}
          onChangeText={setWithdrawAmount}
        />
        <Text style={FundingScreenStyle.button} onPress={async () => {
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

