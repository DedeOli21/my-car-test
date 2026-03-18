import { apiRequest } from "@/lib/http-client";
import type {
  FinanceBalanceResponse,
  OpenBankingSyncRequest,
} from "@/types/api";

export const financeService = {
  getBalance() {
    return apiRequest<FinanceBalanceResponse>("/finance/balance");
  },

  syncOpenBanking(payload: OpenBankingSyncRequest) {
    return apiRequest<FinanceBalanceResponse>("/finance/open-banking/sync", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
};
