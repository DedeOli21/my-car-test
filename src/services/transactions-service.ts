import { apiRequest } from "@/lib/http-client";
import type { CreateTransactionRequest, Transaction } from "@/types/api";

export const transactionsService = {
  list() {
    return apiRequest<Transaction[]>("/transactions");
  },

  createFreight(payload: CreateTransactionRequest) {
    return apiRequest<Transaction>("/transactions/freight", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  createFuel(payload: CreateTransactionRequest) {
    return apiRequest<Transaction>("/transactions/fuel", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
};
