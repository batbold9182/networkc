// config.ts
import { Platform } from "react-native";


const LOCAL_IP = "192.168.10.15";  
const PORT = 3001; 


export const BACKEND_URL =
  Platform.OS === "android"
    ? `http://${LOCAL_IP}:${PORT}`  
    : Platform.OS === "ios"
    ? `http://${LOCAL_IP}:${PORT}`  
    : `http://${LOCAL_IP}:${PORT}`; 
