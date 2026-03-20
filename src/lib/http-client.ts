import { API_BASE_URL } from "@/lib/env";
import { tokenStorage } from "@/lib/token-storage";
import type { AuthTokenResponse } from "@/types/api";

interface RequestConfig extends RequestInit {
  skipAuth?: boolean;
  retry401?: boolean;
  timeoutMs?: number;
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
const DEFAULT_TIMEOUT_MS = 15000;

const BLOCKED_CORS_REQUEST_HEADERS = new Set([
  "access-control-allow-origin",
  "access-control-allow-headers",
  "access-control-allow-methods",
  "access-control-allow-credentials",
]);

const sanitizeHeaders = (headers: HeadersInit = {}) => {
  const normalized = new Headers(headers);

  BLOCKED_CORS_REQUEST_HEADERS.forEach((headerName) => {
    normalized.delete(headerName);
  });

  return normalized;
};

const buildApiErrorMessage = (status: number, data: unknown) => {
  if (typeof data === "object" && data) {
    const maybeMessage = (data as { message?: unknown }).message;
    if (Array.isArray(maybeMessage)) {
      return maybeMessage.join(" | ");
    }
    if (typeof maybeMessage === "string" && maybeMessage.trim()) {
      return maybeMessage;
    }
  }

  if (typeof data === "string" && data.trim()) {
    return data;
  }

  return `Request failed with status ${status}`;
};

const fetchWithTimeout = async (
  input: string,
  init: RequestInit = {},
  timeoutMs = DEFAULT_TIMEOUT_MS
) => {
  const timeoutController = new AbortController();
  const combinedController = new AbortController();
  const timeoutId = setTimeout(() => timeoutController.abort(), timeoutMs);

  const onAbort = () => combinedController.abort();

  if (init.signal?.aborted) {
    combinedController.abort();
  } else if (init.signal) {
    init.signal.addEventListener("abort", onAbort, { once: true });
  }

  timeoutController.signal.addEventListener("abort", onAbort, { once: true });

  try {
    return await fetch(input, {
      ...init,
      signal: combinedController.signal,
    });
  } finally {
    clearTimeout(timeoutId);
    init.signal?.removeEventListener("abort", onAbort);
    timeoutController.signal.removeEventListener("abort", onAbort);
  }
};

const parseResponse = async <T>(response: Response): Promise<T> => {
  if (response.status === 204) {
    return undefined as T;
  }

  const contentType = response.headers.get("content-type") || "";
  const isJson = contentType.includes("application/json");
  const bodyText = await response.text();

  let data: unknown = bodyText;
  if (isJson && bodyText) {
    try {
      data = JSON.parse(bodyText);
    } catch {
      data = bodyText;
    }
  }

  if (!response.ok) {
    const message = buildApiErrorMessage(response.status, data);
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
    const response = await fetchWithTimeout(`${API_BASE_URL}/auth/refresh`, {
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
  const {
    skipAuth = false,
    retry401 = true,
    timeoutMs = DEFAULT_TIMEOUT_MS,
    headers,
    ...rest
  } = config;
  const accessToken = tokenStorage.getAccessToken();

  if (rest.mode === "no-cors") {
    throw new ApiError(
      "Configuração inválida: mode 'no-cors' bloqueia leitura da resposta.",
      0,
      null
    );
  }

  const requestHeaders = sanitizeHeaders({
    "Content-Type": "application/json",
    ...(headers || {}),
  });

  if (!skipAuth && accessToken) {
    requestHeaders.set("Authorization", `Bearer ${accessToken}`);
  }

  let response: Response;
  try {
    response = await fetchWithTimeout(
      `${API_BASE_URL}${path}`,
      {
        ...rest,
        headers: requestHeaders,
      },
      timeoutMs
    );
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      throw new ApiError("Timeout: a API demorou para responder.", 0, null);
    }

    throw new ApiError(
      "Falha de rede/CORS ao chamar a API. Verifique URL, CORS e conectividade.",
      0,
      null
    );
  }

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
      headers: sanitizeHeaders({
        ...(headers || {}),
        Authorization: `Bearer ${refreshedToken}`,
      }),
    });
  }

  return parseResponse<T>(response);
};
