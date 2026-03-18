import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { decodeJwt } from "@/lib/jwt";
import { tokenStorage } from "@/lib/token-storage";
import type { AuthTokenResponse, JwtPayload, UserRole } from "@/types/api";

interface AuthContextValue {
  isAuthenticated: boolean;
  user: JwtPayload | null;
  role: UserRole | null;
  login: (tokens: AuthTokenResponse) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const buildUserFromAccessToken = () => {
  const accessToken = tokenStorage.getAccessToken();
  if (!accessToken) {
    return null;
  }

  return decodeJwt(accessToken);
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<JwtPayload | null>(buildUserFromAccessToken);

  const login = (tokens: AuthTokenResponse) => {
    tokenStorage.setTokens(tokens.accessToken, tokens.refreshToken);
    setUser(decodeJwt(tokens.accessToken));
  };

  const logout = () => {
    tokenStorage.clear();
    setUser(null);
  };

  useEffect(() => {
    const onLogout = () => {
      logout();
    };

    window.addEventListener("auth:logout", onLogout);
    return () => window.removeEventListener("auth:logout", onLogout);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      isAuthenticated: Boolean(user),
      user,
      role: user?.role || null,
      login,
      logout,
    }),
    [user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
};
