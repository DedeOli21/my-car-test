import type { JwtPayload } from "@/types/api";

const decodeBase64Url = (input: string) => {
  const normalized = input.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
  return atob(padded);
};

export const decodeJwt = (token: string): JwtPayload | null => {
  try {
    const payload = token.split(".")[1];
    if (!payload) {
      return null;
    }

    const decoded = decodeBase64Url(payload);
    return JSON.parse(decoded) as JwtPayload;
  } catch {
    return null;
  }
};
