// api.ts
import axios from "axios";
import { useMemo } from "react";
import { useAuth } from "./auth";
import { BACKEND_URL } from "./config";

export async function sellCurrency(token: string, amountForeign: number, rate: number, code: string) {
  const res = await fetch(`${BACKEND_URL}/api/transaction/sell`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ amountForeign, rate, code }),
  });
  return res.json();
}

export const useApi = () => {
  const { token } = useAuth();

  return useMemo(() => {
    return axios.create({
      baseURL: BACKEND_URL,
      headers: {
        Authorization: token ? `Bearer ${token}` : "",
      },
    });
  }, [token]);
};

// Convenience API wrappers
export const useTransactionsApi = () => {
  const api = useApi();
  return useMemo(() => ({
    list: (params?: { limit?: number; skip?: number }) =>
      api.get("/api/transactions", { params }),
  }), [api]);
};
