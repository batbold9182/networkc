import { useRouter } from "expo-router";
import React from "react";
import { Image, ImageBackground, ScrollView, StyleSheet, Text, View } from "react-native";
import { useAuth } from "../../auth";


export default function HomeScreen() {
  const { token, signOut, user } = useAuth();
  const router = useRouter();

  

  return (
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Image source={require("../../assets/images/logo.png")} style={styles.logo} />
        <Text style={styles.title}>Currency Converter</Text>

        {user && <Text style={styles.info}>Logged in as: {user.email}</Text>}

        {token && user && (
          <View style={{ width: "100%" }}>
            <Text style={styles.link} onPress={() => router.push('/screens/WalletScreen')}>Wallet</Text>
            <Text style={styles.link} onPress={() => router.push('/screens/ConverterScreen')}>Currency Converter</Text>
            <Text style={styles.link} onPress={() => router.push({ pathname: '/screens/HistoricalScreen', params: { currency: 'USD' } })}>Historical Rates</Text>
          </View>
        )}

        <Text style={styles.button} onPress={async()=>await signOut()}>Sign Out</Text>
      </ScrollView>

  );
}

const styles = StyleSheet.create({
  container: { flexGrow:1, justifyContent:"center", padding:20 },
  button: { color:"#007AFF", marginTop:20, padding:15, backgroundColor:"#000000ff", borderRadius:50, textAlign:"center", fontSize:16, fontWeight:"bold" },
  title: { fontSize:26, textAlign:"center", marginBottom:20, fontWeight:"bold", color:"#000000ff" },
  info: { fontSize:20, textAlign:"center", marginBottom:20, color:"#000000ff" },
  logo: { width:200, height:200, resizeMode:"contain", alignSelf:"center" },
  link: { color: "#007AFF", textAlign: "center", padding: 12, backgroundColor: "#000000ff", borderRadius: 8, marginVertical: 6 },
});
