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
import { BACKEND_URL } from "../../config";
import { SignUpScreenStyles } from "../../styles/Styles";
export default function SignUpScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const validate = () => {
    if (!email.includes("@")) {
      setError("Please enter a valid email.");
      return false;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return false;
    }
    return true;
  };

  const handleSignUp = async () => {
    if (!validate()) return;
    try {
      setError("");
      await axios.post(`${BACKEND_URL}/api/user/register`, { email, password });
      router.replace("/screens/LoginScreen");
    } catch (err: any) {
      setError(err.response?.data?.message || "Sign up failed. Try again.");
    }
  };

  return (
    <ImageBackground
      source={require("../../assets/images/screen-mobile.jpg")}
      style={SignUpScreenStyles.Background}
      resizeMode="cover"
    >
      <SafeAreaView
        style={[
          SignUpScreenStyles.container,
          { backgroundColor: "rgba(0,0,0,0.4)" },
        ]}
      >
        <ScrollView
          contentContainerStyle={SignUpScreenStyles.inner}
          keyboardShouldPersistTaps="handled"
        >
          {/* Logo */}
          <Image
            source={require("../../assets/images/logo.png")}
            style={SignUpScreenStyles.logo}
          />

          <Text style={SignUpScreenStyles.title}>Sign Up</Text>
          <Text style={SignUpScreenStyles.subtitle}>Create your account</Text>
          {/* Inputs */}
          <TextInput
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            style={[
              SignUpScreenStyles.input,
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
              SignUpScreenStyles.input,
              { backgroundColor: "rgba(255,255,255,0.85)" },
            ]}
            placeholderTextColor="#999"
          />

          {error ? <Text style={SignUpScreenStyles.error}>{error}</Text> : null}
          {/* Button */}
          <TouchableOpacity
            style={SignUpScreenStyles.button}
            onPress={handleSignUp}
          >
            <Text style={SignUpScreenStyles.buttonText}>Sign Up</Text>
          </TouchableOpacity>

          {/* Navigate */}
          <TouchableOpacity onPress={() => router.push("/screens/LoginScreen")}>
            <Text style={SignUpScreenStyles.link}>
              Already have an account? Log in
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </ImageBackground>
  );
}
