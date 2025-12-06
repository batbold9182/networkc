import { useRouter } from "expo-router";
import React from "react";
import { Image, ImageBackground, ScrollView, StyleSheet, Text, View } from "react-native";
import { useAuth } from "../../auth";


export default function HomeScreen() {
  const { token, signOut, user } = useAuth();
  const router = useRouter();

  

  return (
    <ImageBackground source={require("../../assets/images/screen-mobile.jpg")} style={{flex:1}} resizeMode="cover">
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Image source={require("../../assets/images/logo.png")} style={styles.logo} />
        <Text style={styles.title}>Currency Converter</Text>

        {user && <Text style={styles.info}>Logged in as: {user.email}</Text>}
        {user && <Text style={styles.info}>Balance: {user.balance?.toFixed(2)} PLN</Text>}

        {token && user && (
          <View style={{ width: "100%" }}>
            <Text style={{ color: "#fff", textAlign: "center", marginBottom: 10 }}>Quick Actions</Text>
            <Text style={styles.link} onPress={() => router.push('/screens/FundingScreen')}>Account Funding</Text>
            <Text style={styles.link} onPress={() => router.push('/screens/ConverterScreen')}>Currency Converter</Text>
            <Text style={styles.link} onPress={() => router.push({ pathname: '/screens/HistoricalScreen', params: { currency: 'USD' } })}>Historical Rates</Text>
          </View>
        )}

        <Text style={styles.button} onPress={async()=>await signOut()}>Sign Out</Text>
      </ScrollView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow:1, justifyContent:"center", padding:20 },
  button: { color:"#007AFF", marginTop:20, padding:15, backgroundColor:"#fff", borderRadius:50, textAlign:"center", fontSize:16, fontWeight:"bold" },
  title: { fontSize:26, textAlign:"center", marginBottom:20, fontWeight:"bold", color:"#fff" },
  info: { fontSize:20, textAlign:"center", marginBottom:20, color:"#fff" },
  logo: { width:200, height:200, resizeMode:"contain", alignSelf:"center" },
  link: { color: "#007AFF", textAlign: "center", padding: 12, backgroundColor: "#fff", borderRadius: 8, marginVertical: 6 },
});
