import type { AuthUser } from "@/types/auth";

const ACCESS_TOKEN_KEY = "chuanphat_access_token";
const REFRESH_TOKEN_KEY = "chuanphat_refresh_token";
const CURRENT_USER_KEY = "chuanphat_current_user";
export const AUTH_STORAGE_EVENT = "chuanphat_auth_storage_changed";

function notifyAuthChanged() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(AUTH_STORAGE_EVENT));
}

export function saveAccessToken(token: string, rememberMe = true) {
  if (typeof window === "undefined") return;

  if (rememberMe) {
    window.localStorage.setItem(ACCESS_TOKEN_KEY, token);
    window.sessionStorage.removeItem(ACCESS_TOKEN_KEY);
    notifyAuthChanged();
    return;
  }

  window.sessionStorage.setItem(ACCESS_TOKEN_KEY, token);
  window.localStorage.removeItem(ACCESS_TOKEN_KEY);
  notifyAuthChanged();
}

export function saveRefreshToken(token: string, rememberMe = true) {
  if (typeof window === "undefined") return;

  if (rememberMe) {
    window.localStorage.setItem(REFRESH_TOKEN_KEY, token);
    window.sessionStorage.removeItem(REFRESH_TOKEN_KEY);
    notifyAuthChanged();
    return;
  }

  window.sessionStorage.setItem(REFRESH_TOKEN_KEY, token);
  window.localStorage.removeItem(REFRESH_TOKEN_KEY);
  notifyAuthChanged();
}

export function saveCurrentUser(user: AuthUser, rememberMe = true) {
  if (typeof window === "undefined") return;
  const value = JSON.stringify(user);
  if (rememberMe) {
    window.localStorage.setItem(CURRENT_USER_KEY, value);
    window.sessionStorage.removeItem(CURRENT_USER_KEY);
    notifyAuthChanged();
    return;
  }
  window.sessionStorage.setItem(CURRENT_USER_KEY, value);
  window.localStorage.removeItem(CURRENT_USER_KEY);
  notifyAuthChanged();
}

export function getCurrentUser(): AuthUser | null {
  if (typeof window === "undefined") return null;
  const value = window.localStorage.getItem(CURRENT_USER_KEY) ?? window.sessionStorage.getItem(CURRENT_USER_KEY);
  if (!value) return null;
  try {
    return JSON.parse(value) as AuthUser;
  } catch {
    return null;
  }
}

export function canViewAllBranches(user: AuthUser | null) {
  if (!user) return false;
  return user.permissions.includes("VIEW_ALL_BRANCHES") || user.role === "ADMIN" || user.role === "SUPER_ADMIN";
}

export function getAccessToken() {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(ACCESS_TOKEN_KEY) ?? window.sessionStorage.getItem(ACCESS_TOKEN_KEY);
}

export function getRefreshToken() {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(REFRESH_TOKEN_KEY) ?? window.sessionStorage.getItem(REFRESH_TOKEN_KEY);
}

export function isRememberedSession() {
  if (typeof window === "undefined") return true;
  return window.localStorage.getItem(REFRESH_TOKEN_KEY) != null;
}

export function clearAccessToken() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(ACCESS_TOKEN_KEY);
  window.sessionStorage.removeItem(ACCESS_TOKEN_KEY);
  window.localStorage.removeItem(REFRESH_TOKEN_KEY);
  window.sessionStorage.removeItem(REFRESH_TOKEN_KEY);
  window.localStorage.removeItem(CURRENT_USER_KEY);
  window.sessionStorage.removeItem(CURRENT_USER_KEY);
  notifyAuthChanged();
}
