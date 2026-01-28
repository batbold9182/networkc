import axios from "axios";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Image,
  ImageBackground,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../../auth";
import { BACKEND_URL } from "../../config";
import { LoginScreenStyles } from "../../styles/Styles";
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
      const res = await axios.post(`${BACKEND_URL}/api/user/login`, {
        email,
        password,
      });
      await signIn(res.data.token);
      router.replace("/screens/HomeScreen");
    } catch (err: any) {
      setError(
        err.response?.data?.message || "Login failed. Please try again.",
      );
    }
  };

  return (
    <ImageBackground
      source={require("../../assets/images/screen-mobile.jpg")}
      style={LoginScreenStyles.Background}
      resizeMode="cover"
    >
      <SafeAreaView
        style={[
          LoginScreenStyles.container,
          { backgroundColor: "rgba(0,0,0,0.4)" },
        ]}
      >
        <ScrollView contentContainerStyle={LoginScreenStyles.inner}>
          <Image
            source={require("../../assets/images/logo.png")}
            style={LoginScreenStyles.logo}
          />
          <Text style={LoginScreenStyles.title}>Welcome Back</Text>
          <Text style={LoginScreenStyles.subtitle}>Login to your account</Text>

          <TextInput
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            style={[
              LoginScreenStyles.input,
              { backgroundColor: "rgba(255,255,255,0.85)" },
            ]}
            placeholderTextColor="#999"
            autoCapitalize="none"
          />

          <TextInput
            placeholder="Password"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            style={[
              LoginScreenStyles.input,
              { backgroundColor: "rgba(255,255,255,0.85)" },
            ]}
            placeholderTextColor="#999"
          />

          {error ? <Text style={LoginScreenStyles.error}>{error}</Text> : null}
          <TouchableOpacity
            style={LoginScreenStyles.button}
            onPress={handleLogin}
          >
            <Text style={LoginScreenStyles.buttonText}>Login</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push("/screens/SignUpScreen")}
          >
            <Text style={LoginScreenStyles.link}>
              Don’t have an account? Sign up
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </ImageBackground>
  );
}
