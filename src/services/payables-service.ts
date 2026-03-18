import { apiRequest } from "@/lib/http-client";
import type { Payable, PayablePaidResponse } from "@/types/api";

export const payablesService = {
  list() {
    return apiRequest<Payable[]>("/payables");
  },

  pay(id: string) {
    return apiRequest<PayablePaidResponse>(`/payables/${id}/pay`, {
      method: "PATCH",
    });
  },
};
