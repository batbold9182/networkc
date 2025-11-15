// api.ts
import axios from "axios";
import { BACKEND_URL } from "./config";
import { useAuth } from "./auth";

export const useApi = () => {
  const { token } = useAuth();

  const instance = axios.create({
    baseURL: BACKEND_URL,
    headers: {
      Authorization: token ? `Bearer ${token}` : "",
    },
  });

  return instance;
};
