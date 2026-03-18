import { apiRequest } from "@/lib/http-client";
import type {
  AuthTokenResponse,
  LoginRequest,
  RegisterRequest,
  RefreshTokenRequest,
} from "@/types/api";

export const authService = {
  register(payload: RegisterRequest) {
    return apiRequest<{ id: string; email: string } | AuthTokenResponse>(
      "/auth/register",
      {
        method: "POST",
        body: JSON.stringify(payload),
        skipAuth: true,
      }
    );
  },

  login(payload: LoginRequest) {
    return apiRequest<AuthTokenResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify(payload),
      skipAuth: true,
    });
  },

  refresh(payload: RefreshTokenRequest) {
    return apiRequest<AuthTokenResponse>("/auth/refresh", {
      method: "POST",
      body: JSON.stringify(payload),
      skipAuth: true,
      retry401: false,
    });
  },
};
