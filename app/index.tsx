import { useEffect } from "react";
import { useRouter } from "expo-router";
import { useAuth } from "../auth";
import { View, Text } from "react-native";

export default function Index() {
  const { token, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (token) router.replace("/HomeScreen");
    else router.replace("/LoginScreen");
  }, [loading, token, router]);

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text>Loading...</Text>
    </View>
  );
}
