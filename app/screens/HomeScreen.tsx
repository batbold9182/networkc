import { useRouter } from "expo-router";
import React from "react";
import { Image, ImageBackground, ScrollView, Text, View } from "react-native";
import { useAuth } from "../../auth";
import { HomeScreenStyles } from "../../styles/Styles";

export default function HomeScreen() {
  const { token, signOut, user } = useAuth();
  const router = useRouter();

  return (
    <ImageBackground
      source={require("../../assets/images/screen-mobile.jpg")}
      style={HomeScreenStyles.Background}
      resizeMode="cover"
    >
      <ScrollView
        contentContainerStyle={HomeScreenStyles.container}
        keyboardShouldPersistTaps="handled"
      >
        <Image
          source={require("../../assets/images/logo.png")}
          style={HomeScreenStyles.logo}
        />
        <Text style={HomeScreenStyles.title}>Currency Converter</Text>

        {user && (
          <Text style={HomeScreenStyles.info}>Logged in as: {user.email}</Text>
        )}

        {token && user && (
          <View style={{ width: "100%" }}>
            <Text
              style={HomeScreenStyles.link}
              onPress={() => router.push("/screens/WalletScreen")}
            >
              Wallet
            </Text>
            <Text
              style={HomeScreenStyles.link}
              onPress={() => router.push("/screens/ConverterScreen")}
            >
              Currency Converter
            </Text>
            <Text
              style={HomeScreenStyles.link}
              onPress={() =>
                router.push({
                  pathname: "/screens/HistoricalScreen",
                  params: { currency: "USD" },
                })
              }
            >
              Historical Rates
            </Text>
            <Text
              style={HomeScreenStyles.link}
              onPress={() => router.push("/screens/TransactionsScreen")}
            >
              Transaction History
            </Text>
          </View>
        )}

        <Text
          style={HomeScreenStyles.button}
          onPress={async () => {
            await signOut();
            router.replace("/screens/LoginScreen");
          }}
        >
          Sign Out
        </Text>
      </ScrollView>
    </ImageBackground>
  );
}
