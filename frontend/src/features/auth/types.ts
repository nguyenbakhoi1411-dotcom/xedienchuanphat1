import type { AuthUser } from "@/types/auth";

export type LoginRequest = {
  identifier: string;
  password: string;
  rememberMe: boolean;
};

export type LoginResponse = {
  accessToken: string;
  refreshToken: string;
  user: AuthUser;
};
