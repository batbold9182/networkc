// auth.tsx
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import React, { createContext, useContext, useEffect, useState } from "react";
import { Platform } from "react-native";
import { BACKEND_URL } from "./config";

type User = {
  _id: string;
  email: string;
  balance?: number; // optional if you plan to track account funding
};

type AuthContextType = {
  token: string | null;
  user: User | null;             // <-- add this
  setUser: React.Dispatch<React.SetStateAction<User | null>>; // <-- add this
  signIn: (token: string) => Promise<void>;
  signOut: () => Promise<void>;
  loading: boolean;
};

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null); // <-- add this
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const restoreToken = async () => {
      try {
        const savedToken =
          Platform.OS === "web"
            ? localStorage.getItem("token")
            : await AsyncStorage.getItem("token");
        if (savedToken) {
          setToken(savedToken);
          // fetch user when token is restored
          try {
            const res = await axios.get(`${BACKEND_URL}/api/user`, {
              headers: { Authorization: `Bearer ${savedToken}` },
            });
            setUser(res.data);
          } catch (err) {
            console.error("Failed to fetch user on restore:", err);
            // invalid token - clear it
            if (Platform.OS === "web") localStorage.removeItem("token");
            else await AsyncStorage.removeItem("token");
            setToken(null);
            setUser(null);
          }
        }
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
      if (Platform.OS === "web") localStorage.setItem("token", newToken);
      else await AsyncStorage.setItem("token", newToken);
      setToken(newToken);

      // Optionally fetch user data after login
      const res = await axios.get(`${BACKEND_URL}/api/user`, {
        headers: { Authorization: `Bearer ${newToken}` },
      });
      setUser(res.data);
    } catch (err) {
      console.error("SignIn error:", err);
    }
  };

  const signOut = async () => {
    try {
      if (Platform.OS === "web") localStorage.removeItem("token");
      else await AsyncStorage.removeItem("token");
      setToken(null);
      setUser(null); // <-- clear user on sign out
    } catch (err) {
      console.error("SignOut error:", err);
    }
  };

  return (
    <AuthContext.Provider value={{ token, user, setUser, signIn, signOut, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
