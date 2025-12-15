import { Stack } from "expo-router";
import { ActivityIndicator, View } from "react-native";
import { AuthProvider, useAuth } from "../auth";

function AppStack() {
  const { loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: "#0a0a0a" },
        headerTintColor: "#fff",
        headerTitleStyle: { color: "#fff" },
      }}
    >
      {/* Auth screens */}
      <Stack.Screen name="screens/LoginScreen" options={{ headerShown: false }} />
      <Stack.Screen name="screens/SignUpScreen" options={{ title: "Sign Up" }} />

      {/* App screens */}
      <Stack.Screen name="screens/HomeScreen" options={{ headerShown: false }} />
      <Stack.Screen name="screens/WalletScreen" options={{ title: "Wallet" }} />
      <Stack.Screen name="screens/ConverterScreen" options={{ title: "Converter" }} />
      <Stack.Screen name="screens/HistoricalScreen" options={{ title: "Historical Rates" }} />
      <Stack.Screen name="screens/FundingScreen" options={{ title: "Fund Account" }} />
      <Stack.Screen name="screens/TransactionsScreen" options={{ title: "Transactions" }} />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <AppStack />
    </AuthProvider>
  );
}
