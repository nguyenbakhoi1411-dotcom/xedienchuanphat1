import { api } from "@/lib/api/axios";
import type { LoginRequest, LoginResponse } from "./types";

export const authApi = {
  async login(payload: LoginRequest): Promise<LoginResponse> {
    const response = await api.post<LoginResponse>("/api/auth/login", payload);
    return {
      ...response.data,
      user: {
        ...response.data.user,
        branchName: response.data.user.branchName ?? (response.data.user.branchId ? `Chi nhanh ${response.data.user.branchId}` : "Tat ca chi nhanh"),
        avatarInitials: response.data.user.avatarInitials ?? initials(response.data.user.fullName)
      }
    };
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

