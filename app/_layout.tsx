import { Stack } from "expo-router";
import { AuthProvider, useAuth } from ".././auth";
import { View, ActivityIndicator } from "react-native";

function AppStack() {
  const { token, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <Stack>
      {!token ? (
        <>
          <Stack.Screen
            name="screens/LoginScreen"
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="screens/SignUpScreen"
            options={{ headerShown: false }}
          />
        </>
      ) : (
        <Stack.Screen
          name="screens/HomeScreen"
          options={{ headerShown: false }}
        />
      )}
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
