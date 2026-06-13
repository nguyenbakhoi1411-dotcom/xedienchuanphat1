import { api } from "@/lib/api/axios";
import { mockUser } from "@/lib/mock-auth";
import type { LoginRequest, LoginResponse } from "./types";

const enableMockLogin = process.env.NEXT_PUBLIC_ENABLE_MOCK_LOGIN === "true";

function canUseMockLogin(payload: LoginRequest) {
  const normalized = payload.identifier.trim().toLowerCase();
  return (
    enableMockLogin &&
    payload.password === "password" &&
    (normalized === "manager@chuanphat.vn" || normalized === "0900000000")
  );
}

export const authApi = {
  async login(payload: LoginRequest): Promise<LoginResponse> {
    try {
      const response = await api.post<LoginResponse>("/api/auth/login", payload);
      return {
        ...response.data,
        user: {
          ...response.data.user,
          branchName: response.data.user.branchName ?? (response.data.user.branchId ? `Chi nhanh ${response.data.user.branchId}` : "Tat ca chi nhanh"),
          avatarInitials: response.data.user.avatarInitials ?? initials(response.data.user.fullName)
        }
      };
    } catch (error) {
      if (canUseMockLogin(payload)) {
        return {
          accessToken: "mock-access-token",
          refreshToken: "mock-refresh-token",
          user: {
            ...mockUser,
            username: payload.identifier
          }
        };
      }

      throw error;
    }
  }
};

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(-2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}
