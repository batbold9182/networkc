import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { useAuth } from "../../auth";
import AccountFunding from "../AccountFunding";

export default function FundingScreen() {
  const { token, user, setUser } = useAuth();

  if (!token || !user) {
    return (
      <View style={styles.center}>
        <Text style={{color:'#fff'}}>Please login to fund account</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <AccountFunding
        token={token}
        onBalanceUpdate={(newBalance) => setUser({ ...user, balance: newBalance })}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "transparent" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
});
