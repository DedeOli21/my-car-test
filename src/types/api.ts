export type UserRole = "ADMIN" | "DRIVER";

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  role: UserRole;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface AuthTokenResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
}

export interface Transaction {
  id: string;
  type: "FREIGHT" | "FUEL";
  amount: number;
  description: string;
  createdAt: string;
}

export interface CreateTransactionRequest {
  amount: number;
  description: string;
}

export interface FinanceBalanceResponse {
  walletBalance: number;
  openBankingBalance: number;
  totalAvailable: number;
}

export interface OpenBankingSyncRequest {
  provider: string;
  availableBalance: number;
}

export interface Payable {
  id: string;
  description: string;
  amount: number;
  status: "PENDING" | "PAID";
  dueDate: string;
  transactionId?: string | null;
  paidAt?: string | null;
}

export interface PayablePaidResponse extends Payable {
  transactionId: string;
}

export interface JwtPayload {
  sub?: string;
  email?: string;
  name?: string;
  role?: UserRole;
  exp?: number;
  iat?: number;
}
