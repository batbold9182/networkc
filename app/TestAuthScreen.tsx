// TestAuthScreen.tsx
import React, { useState } from "react";
import { ScrollView, View, Text, TextInput, Button, StyleSheet,  } from "react-native";
import axios from "axios";
import { BACKEND_URL } from "../config";
import { Background } from "@react-navigation/elements";

export default function TestAuthScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [log, setLog] = useState<string[]>([]);

  const addLog = (msg: string) => setLog(prev => [msg, ...prev]);

  // --- Ping Server ---
  const handlePing = async () => {
    const url = `${BACKEND_URL}/api/ping`;
    addLog(`➡️ PING: ${url}`);
    try {
      const res = await axios.get(url);
      addLog(`✅ Response: ${JSON.stringify(res.data)}`);
    } catch (err: any) {
      addLog(`❌ PING ERROR: ${err.message}`);
    }
  };

  // --- Sign Up ---
  const handleSignup = async () => {
    const url = `${BACKEND_URL}/api/user/register`;
    addLog(`➡️ SignUp: ${url}`);
    addLog(`Payload: ${JSON.stringify({ email, password })}`);
    try {
      const res = await axios.post(
        url,
        { email, password },
        { headers: { "Content-Type": "application/json" } } // Important for preflight
      );
      addLog(`✅ SignUp success: ${JSON.stringify(res.data)}`);
    } catch (err: any) {
      if (err.response) {
        addLog(`❌ Server error: ${err.response.status} - ${JSON.stringify(err.response.data)}`);
      } else if (err.request) {
        addLog(`⚠️ No response received: ${JSON.stringify(err.request, null, 2).slice(0, 300)}...`);
      } else {
        addLog(`💥 Axios error: ${err.message}`);
      }
    }
  };

  // --- Login ---
  const handleLogin = async () => {
    const url = `${BACKEND_URL}/api/user/login`;
    addLog(`➡️ Login: ${url}`);
    addLog(`Payload: ${JSON.stringify({ email, password })}`);
    try {
      const res = await axios.post(
        url,
        { email, password },
        { headers: { "Content-Type": "application/json" } }
      );
      addLog(`✅ Login success: ${JSON.stringify(res.data)}`);
      // Optionally, save token somewhere (useAuth or AsyncStorage)
    } catch (err: any) {
      if (err.response) {
        addLog(`❌ Server error: ${err.response.status} - ${JSON.stringify(err.response.data)}`);
      } else if (err.request) {
        addLog(`⚠️ No response received: ${JSON.stringify(err.request, null, 2).slice(0, 300)}...`);
      } else {
        addLog(`💥 Axios error: ${err.message}`);
      }
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Test Auth (LAN)</Text>
      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        style={styles.input}
      />
      <TextInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={styles.input}
      />
      <View style={styles.buttons}>
        <Button title="Ping Server" onPress={handlePing} />
        <Button title="Sign Up" onPress={handleSignup} />
        <Button title="Login" onPress={handleLogin} />
      </View>
      <View style={styles.logContainer}>
        {log.map((l, i) => (
          <Text key={i} style={styles.logText}>{l}</Text>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  
  container: { flexGrow: 1, justifyContent: "center", padding: 20 },
  title: { fontSize: 24, textAlign: "center", marginBottom: 20 },
  input: { borderWidth: 1, borderColor: "#ccc", padding: 10, marginBottom: 10, borderRadius: 5 },
  buttons: { flexDirection: "column", justifyContent: "space-between", marginBottom: 20 },
  logContainer: { marginTop: 10 },
  logText: { fontSize: 14, marginBottom: 5, color: "#333" },
});
