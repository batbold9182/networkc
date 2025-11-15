// auth.tsx
import React, { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";
import axios from "axios";
import { BACKEND_URL } from "./config";

type AuthContextType = {
  token: string | null;
  signIn: (token: string) => Promise<void>;
  signOut: () => Promise<void>;
  loading: boolean;
};

const AuthContext = createContext<AuthContextType>({
  token: null,
  signIn: async () => {},
  signOut: async () => {},
  loading: true,
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Restore token on app start
  useEffect(() => {
    const restoreToken = async () => {
      try {
        const savedToken =
          Platform.OS === "web"
            ? localStorage.getItem("token")
            : await AsyncStorage.getItem("token");
        console.log("🔐 Restored token:", savedToken);
        if (savedToken) setToken(savedToken);
      } catch (err) {
        console.error("Token restore error:", err);
      } finally {
        setLoading(false);
      }
    };
    restoreToken();
  }, []);

  const signIn = async (newToken: string) => {
    try {
      if (Platform.OS === "web") {
        localStorage.setItem("token", newToken);
      } else {
        await AsyncStorage.setItem("token", newToken);
      }
      setToken(newToken);
    } catch (err) {
      console.error("SignIn error:", err);
    }
  };

  const signOut = async () => {
    try {
      if (Platform.OS === "web") {
        localStorage.removeItem("token");
      } else {
        await AsyncStorage.removeItem("token");
      }
      setToken(null);
    } catch (err) {
      console.error("SignOut error:", err);
    }
  };

  return (
    <AuthContext.Provider value={{ token, signIn, signOut, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
