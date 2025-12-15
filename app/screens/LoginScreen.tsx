import axios from "axios";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Image, ImageBackground, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../../auth";
import { BACKEND_URL } from "../../config";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();
  const { signIn } = useAuth();

  const validate = () => {
    if (!email.includes("@")) {
      setError("Please enter a valid email.");
      return false;
    }
    if (password.length === 0) {
      setError("Please enter your password.");
      return false;
    }
    return true;
  };

  const handleLogin = async () => {
    if (!validate()) return;
    try {
      setError("");
      const res = await axios.post(`${BACKEND_URL}/api/user/login`, { email, password });
      await signIn(res.data.token);
      router.replace("/screens/HomeScreen");
    } catch (err:any) {
      setError(err.response?.data?.message || "Login failed. Please try again.");
    }
  };

  return (
    <ImageBackground
      source={require("../../assets/images/screen-mobile.jpg")}
      style={styles.Background}
      resizeMode="cover"
    >
      <SafeAreaView style={[styles.container, { backgroundColor: "rgba(0,0,0,0.4)" }]}> 
        <ScrollView contentContainerStyle={styles.inner}>    
          <Image
            source={require("../../assets/images/logo.png")}
            style={styles.logo}
          />    
          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.subtitle}>Login to your account</Text>

          <TextInput
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            style={[styles.input, { backgroundColor: "rgba(255,255,255,0.85)" }]}
            placeholderTextColor="#999"
            autoCapitalize="none"
          />

          <TextInput
            placeholder="Password"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            style={[styles.input, { backgroundColor: "rgba(255,255,255,0.85)" }]}
            placeholderTextColor="#999"
          />

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <TouchableOpacity style={styles.button} onPress={handleLogin}>
            <Text style={styles.buttonText}>Login</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.push("/screens/SignUpScreen")}>
            <Text style={styles.link}>Don’t have an account? Sign up</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  logo:{ width: 120, height: 120, resizeMode: "contain", alignSelf: "center", marginBottom: 20 },
  container: {
    flex: 1,
  },
  inner: {
    padding: 20,
    justifyContent: "center",
  },
  title: {
    fontSize: 32,
    fontWeight: "700",
    marginBottom: 10,
    textAlign: "center",
    color: "#fff",
  },
  subtitle: {
    fontSize: 16,
    color: "#eee",
    marginBottom: 30,
    textAlign: "center",
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 12,
    paddingHorizontal: 15,
    marginBottom: 15,
    fontSize: 16,
  },
  button: {
    backgroundColor: "#007AFF",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  link: {
    marginTop: 20,
    color: "#fff",
    textAlign: "center",
    fontSize: 15,
  },
  error: {
    color: "#ff8080",
    marginBottom: 10,
    textAlign: "center",
  },
  Background:{
    flex: 1 ,
    width: '100%',
    height: '100%'
  }
});