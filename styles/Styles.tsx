import { StyleSheet } from "react-native";

export const HistoricalScreenStyles = StyleSheet.create({
  Background: { flex: 1, width: "100%", height: "100%" },
  container: {
    marginVertical: 10,
    padding: 10,
    backgroundColor: "rgba(0,0,0,0.3)",
    borderRadius: 5,
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
    color: "#fff",
    fontWeight: "bold",
  },
  rateText: { color: "#fff", marginVertical: 2 },
  noData: { color: "#fff", fontStyle: "italic" },
});
export const FundingScreenStyle = StyleSheet.create({
    container: { flex: 1, padding: 20, backgroundColor: "transparent" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  balanceRow: { flexDirection: "row", justifyContent: "center", alignItems: "center", marginBottom: 10 },
  balanceLabel: { color: "#fff", fontSize: 18, fontWeight: "600" },
  balanceValue: { color: "#66ffa0ff", fontSize: 20, fontWeight: "700" },
  section: { marginTop: 20, padding: 10, backgroundColor: "rgba(0,0,0,0.3)", borderRadius: 5 },
  label: { fontSize: 16, marginBottom: 5, color: "#fff" },
  input: { borderWidth: 1, borderColor: "#ccc", padding: 10, borderRadius: 5, color: "#000", backgroundColor: "rgba(255,255,255,0.85)" },
  button: { color: "#fff", marginTop: 10, padding: 12, backgroundColor: "#cc3344", borderRadius: 50, textAlign: "center", fontSize: 16, fontWeight: "bold" },
  Background: { flex: 1 ,width: '100%', height: '100%'},
});
export const ConverterScreenStyles = StyleSheet.create({
    Background: { flex: 1, width: "100%", height: "100%" },
    Text:{fontSize:22, color:"#fff", marginBottom:20}
});
export const HomeScreenStyles = StyleSheet.create({
  Background: { flex: 1, width: "100%", height: "100%" },
  container: { flexGrow:1, justifyContent:"center", padding:20 },
  button: { color:"#000000ff", marginTop:20, padding:15, backgroundColor:"#66ffa0ff", borderRadius:50, textAlign:"center", fontSize:16, fontWeight:"bold" },
  title: { fontSize:26, textAlign:"center", marginBottom:20, fontWeight:"bold", color:"#000000ff" },
  info: { fontSize:20, textAlign:"center", marginBottom:20, color:"#000000ff" },
  logo: { width:200, height:200, resizeMode:"contain", alignSelf:"center" },
  link: { color: "#000000ff", textAlign: "center", padding: 12, backgroundColor: "#66ffa0ff", borderRadius: 50, marginVertical: 6 },
});
export const LoginScreenStyles = StyleSheet.create({
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
export const SignUpScreenStyles = StyleSheet.create({
  logo:{ width: 120, height: 120, resizeMode: "contain", alignSelf: "center", marginBottom: 20 },
  container: { flex: 1 },
  inner: { padding: 20, justifyContent: "center" },
  title: { fontSize: 32, fontWeight: "700", marginBottom: 10, textAlign: "center", color: "#fff" },
  subtitle: { fontSize: 16, color: "#eee", marginBottom: 30, textAlign: "center" },
  input: { height: 50, borderWidth: 1, borderColor: "#ddd", borderRadius: 12, paddingHorizontal: 15, marginBottom: 15, fontSize: 16 },
  button: { backgroundColor: "#007AFF", paddingVertical: 14, borderRadius: 12, alignItems: "center", marginTop: 10 },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
  link: { marginTop: 20, color: "#fff", textAlign: "center", fontSize: 15 },
  error: { color: "#ff8080", marginBottom: 10, textAlign: "center" },
  Background:{ flex: 1 ,width: '100%', height: '100%' },
});
export const WalletScreenStyles = StyleSheet.create({
  container: { flexGrow: 1, padding: 20, justifyContent: "center" },
  title: { fontSize: 26, textAlign: "center", color: "#fff", marginBottom: 10, fontWeight: "bold" },
  info: { fontSize: 18, textAlign: "center", marginBottom: 5, color: "#fff" },
  label: { fontSize: 16, marginTop: 10, marginBottom: 5, color: "#fff" },
  input: { borderWidth: 1, borderColor: "#ccc", padding: 10, borderRadius: 5, color: "#000", backgroundColor: "rgba(255,255,255,0.85)" },
  result: { fontSize: 18, textAlign: "center", marginTop: 15, fontWeight: "bold", color: "#fff" },
  buyButton: { marginTop: 20, padding: 15, backgroundColor: "#00cc44", borderRadius: 40, textAlign: "center", color: "#fff", fontSize: 18, fontWeight: "bold" },
  historyButton: { marginTop: 15, padding: 12, borderRadius: 30, textAlign: "center", color: "#fff", fontSize: 16, borderWidth: 1, borderColor: "#fff" },
  Background:{ flex: 1 ,width: '100%', height: '100%' },
});
export const TransactionsScreenStyles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 26, textAlign: "center", color: "#fff", marginBottom: 10, fontWeight: "bold" },
  info: { fontSize: 18, textAlign: "center", marginTop: 20, color: "#fff" },
  txItem: { padding: 12, borderRadius: 8, backgroundColor: "rgba(0,0,0,0.35)", marginBottom: 10 },
  txMain: { fontSize: 16, color: "#fff", fontWeight: "600" },
  txMeta: { fontSize: 13, color: "#ddd" },
  loadMore: { marginTop: 10, textAlign: "center", color: "#fff", padding: 10, borderWidth: 1, borderColor: "#fff", borderRadius: 20 },
  Background:{ flex: 1 ,width: '100%', height: '100%' },
});
