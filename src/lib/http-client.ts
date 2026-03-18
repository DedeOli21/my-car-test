import { API_BASE_URL } from "@/lib/env";
import { tokenStorage } from "@/lib/token-storage";
import type { AuthTokenResponse } from "@/types/api";

interface RequestConfig extends RequestInit {
  skipAuth?: boolean;
  retry401?: boolean;
}

export class ApiError extends Error {
  status: number;
  data: unknown;

  constructor(message: string, status: number, data: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

let refreshPromise: Promise<string | null> | null = null;

const parseResponse = async <T>(response: Response): Promise<T> => {
  const contentType = response.headers.get("content-type") || "";
  const isJson = contentType.includes("application/json");
  const data = isJson ? await response.json() : await response.text();

  if (!response.ok) {
    const message =
      typeof data === "object" && data && "message" in data
        ? String((data as { message?: unknown }).message)
        : `Request failed with status ${response.status}`;

    throw new ApiError(message, response.status, data);
  }

  return data as T;
};

const isAuthEndpoint = (url: string) =>
  url.includes("/auth/login") ||
  url.includes("/auth/register") ||
  url.includes("/auth/refresh");

const refreshAccessToken = async (): Promise<string | null> => {
  const refreshToken = tokenStorage.getRefreshToken();

  if (!refreshToken) {
    return null;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ refreshToken }),
    });

    const data = await parseResponse<AuthTokenResponse>(response);
    tokenStorage.setTokens(data.accessToken, data.refreshToken);

    return data.accessToken;
  } catch {
    tokenStorage.clear();
    window.dispatchEvent(new CustomEvent("auth:logout"));
    return null;
  }
};

const getOrCreateRefreshPromise = () => {
  if (!refreshPromise) {
    refreshPromise = refreshAccessToken().finally(() => {
      refreshPromise = null;
    });
  }

  return refreshPromise;
};

export const apiRequest = async <T>(
  path: string,
  config: RequestConfig = {}
): Promise<T> => {
  const { skipAuth = false, retry401 = true, headers, ...rest } = config;
  const accessToken = tokenStorage.getAccessToken();

  const requestHeaders: HeadersInit = {
    "Content-Type": "application/json",
    ...(headers || {}),
  };

  if (!skipAuth && accessToken) {
    requestHeaders.Authorization = `Bearer ${accessToken}`;
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...rest,
    headers: requestHeaders,
  });

  if (
    response.status === 401 &&
    retry401 &&
    !skipAuth &&
    !isAuthEndpoint(path)
  ) {
    const refreshedToken = await getOrCreateRefreshPromise();

    if (!refreshedToken) {
      throw new ApiError("Session expired", 401, null);
    }

    return apiRequest<T>(path, {
      ...config,
      retry401: false,
      headers: {
        ...(headers || {}),
        Authorization: `Bearer ${refreshedToken}`,
      },
    });
  }

  return parseResponse<T>(response);
};
