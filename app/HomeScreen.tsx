import { Picker } from "@react-native-picker/picker";
import axios from "axios";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, Text, TextInput, View, ImageBackground,Image } from "react-native";
import { useAuth } from "../auth";
import { BACKEND_URL } from "../config";

type Rate = {
  currency: string;
  code: string;
  mid: number;
};

export default function HomeScreen() {
  const { token, signOut, loading: authLoading } = useAuth();
  const router = useRouter();

  const [user, setUser] = useState<any>(null);
  const [rates, setRates] = useState<Rate[]>([]);
  const [selectedRate, setSelectedRate] = useState<Rate | null>(null);
  const [amount, setAmount] = useState("");
  const [converted, setConverted] = useState<number | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [loadingRates, setLoadingRates] = useState(true);

  useEffect(() => {
    if (authLoading || !token) return;

    const fetchData = async () => {
      try {
        const userRes = await axios.get(`${BACKEND_URL}/api/user`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(userRes.data);
      } catch (err) {
        console.error("Fetch user error:", err);
        setUser(null);
      } finally {
        setLoadingUser(false);
      }

      try {
        const ratesRes = await axios.get<Rate[]>(`${BACKEND_URL}/api/rates`);
        setRates(ratesRes.data);
        setSelectedRate(ratesRes.data.find(r => r.code === "USD") || null);
      } catch (err) {
        console.error("Fetch rates error:", err);
      } finally {
        setLoadingRates(false);
      }
    };

    fetchData();
  }, [token, authLoading]);

  useEffect(() => {
    if (!selectedRate || !amount) {
      setConverted(null);
      return;
    }
    const value = parseFloat(amount);
    if (isNaN(value)) {
      setConverted(null);
      return;
    }
    setConverted(value * selectedRate.mid);
  }, [amount, selectedRate]);

  const handleSignOut = async () => {
    await signOut();
    router.replace("/LoginScreen");
  };

  return (
    <ImageBackground
      source={require('../assets/images/screen-mobile.jpg')}
      style={{ flex: 1 }}
      resizeMode="cover"
    >
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Image
                    source={require("../assets/images/logo.png")}
                    style={styles.logo}
                  />
        <Text style={styles.title}>Currency Converter</Text>

        {loadingUser ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : user ? (
          <Text style={styles.info}>Logged in as: {user.email}</Text>
        ) : (
          <Text style={styles.info}>User not found</Text>
        )}


        <View style={styles.section}>
          <Text style={styles.label}>Amount in PLN:</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter amount"
            placeholderTextColor="#999"
            keyboardType="numeric"
            value={amount}
            onChangeText={setAmount}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Select currency:</Text>
          {loadingRates ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={selectedRate?.code}
                onValueChange={code => {
                  const rate = rates.find(r => r.code === code) || null;
                  setSelectedRate(rate);
                }}
                style={{ color: '#fff' }}
              >
                {rates.map(r => (
                  <Picker.Item label={`${r.code} (${r.currency})`} value={r.code} key={r.code} />
                ))}
              </Picker>
            </View>
          )}
        </View>
       <Text style={styles.button} onPress={handleSignOut}>Sign Out</Text>
        {converted !== null && selectedRate && (
          <Text style={styles.result}>
            {amount} PLN = {converted.toFixed(2)} {selectedRate.code}
          </Text>
        )}
      </ScrollView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  button:{color: '#007AFF', marginTop: 20, padding: 15, backgroundColor: '#fff', borderRadius: 50, textAlign: 'center',fontSize:16, fontWeight:'bold'},
  title: { fontSize: 26, textAlign: 'center', marginBottom: 20, fontWeight: 'bold', color: '#fff'},
  info: { fontSize: 20, textAlign: 'center', marginBottom: 20, color: '#fff'},
  section: { marginVertical: 10, padding: 10, backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: 5 },
  label: { fontSize: 16, marginBottom: 5, color: '#fff' },
  input: { borderWidth: 1, borderColor: '#ccc', padding: 10, borderRadius: 5, color: '#000', backgroundColor: 'rgba(255,255,255,0.85)' },
  pickerContainer: { borderWidth: 1, borderColor: '#ccc', borderRadius: 5, backgroundColor: 'rgba(0, 0, 0, 3)' },
  result: { fontSize: 18, textAlign: 'center', marginTop: 20, fontWeight: 'bold', color: '#fff' },
  logo:{ width: 200, height: 200, resizeMode: "contain", alignSelf: "center" },
});
