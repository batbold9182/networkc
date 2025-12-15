import React, { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, FlatList, ImageBackground, RefreshControl, StyleSheet, Text, View } from "react-native";
import { useTransactionsApi } from "../../api";
import { useAuth } from "../../auth";

export default function TransactionsScreen() {
  const { token } = useAuth();
  const txApi = useTransactionsApi();

  const [transactions, setTransactions] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [skip, setSkip] = useState(0);
  const limit = 20;
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async (reset: boolean = false) => {
    if (!token) return;
    if (loading) return;
    try {
      if (reset) setRefreshing(true); else setLoading(true);
      const nextSkip = reset ? 0 : skip;
      const res = await txApi.list({ limit, skip: nextSkip });
      const { items, total: newTotal } = res.data;
      setTransactions(prev => (reset ? items : [...prev, ...items]));
      setTotal(newTotal);
      setSkip(nextSkip + items.length);
    } catch (err) {
      console.error("Failed to load transactions", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [token, loading, skip, txApi]);

  useEffect(() => {
    load(true);
  }, [load]);

  const renderItem = ({ item }: { item: any }) => (
    <View style={styles.txItem}>
      <Text style={styles.txMain}>
        {item.type === "BUY" ? "Buy" : item.type} {item.fromCurrency}
        {" -> "}
        {item.toCurrency}
      </Text>
      <Text style={styles.txMeta}>Amount: {item.amount} @ {item.rate}</Text>
      <Text style={styles.txMeta}>{new Date(item.createdAt).toLocaleString()}</Text>
    </View>
  );

  return (
    <ImageBackground
      source={require("../../assets/images/screen-mobile.jpg")}
      style={styles.Background}
      resizeMode="cover"
    >
      <View style={styles.container}>
        <Text style={styles.title}>Transaction History</Text>

        <FlatList
          data={transactions}
          keyExtractor={(item, idx) => item._id || String(idx)}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 40 }}
          ListEmptyComponent={
            loading ? <ActivityIndicator size="small" color="#fff" /> :
            <Text style={styles.info}>No transactions yet.</Text>
          }
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => load(true)}
              tintColor="#fff"
            />
          }
          ListFooterComponent={
            transactions.length < total ? (
              <Text style={styles.loadMore} onPress={() => load(false)}>
                {loading ? "Loading..." : "Load more"}
              </Text>
            ) : null
          }
        />
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 26, textAlign: "center", color: "#fff", marginBottom: 10, fontWeight: "bold" },
  info: { fontSize: 18, textAlign: "center", marginTop: 20, color: "#fff" },
  txItem: { padding: 12, borderRadius: 8, backgroundColor: "rgba(0,0,0,0.35)", marginBottom: 10 },
  txMain: { fontSize: 16, color: "#fff", fontWeight: "600" },
  txMeta: { fontSize: 13, color: "#ddd" },
  loadMore: { marginTop: 10, textAlign: "center", color: "#fff", padding: 10, borderWidth: 1, borderColor: "#fff", borderRadius: 20 },
  Background:{ flex: 1 ,width: '100%', height: '100%' },
});
