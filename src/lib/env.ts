const PRODUCTION_API_BASE_URL =
  "https://o15aa028j2.execute-api.us-east-2.amazonaws.com";

const trimTrailingSlash = (value: string) => value.replace(/\/+$/, "");

const envBaseUrl =
  import.meta.env.VITE_API_BASE_URL?.trim() ||
  import.meta.env.VITE_API_URL?.trim() ||
  "";

export const API_BASE_URL = trimTrailingSlash(
  envBaseUrl || PRODUCTION_API_BASE_URL
);
