"use client";

import { useEffect, useState } from "react";
import type { AuthUser } from "@/types/auth";
import { AUTH_STORAGE_EVENT, getCurrentUser } from "./token";

export function useCurrentUser() {
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    function syncUser() {
      setUser(getCurrentUser());
    }

    syncUser();
    window.addEventListener(AUTH_STORAGE_EVENT, syncUser);
    window.addEventListener("storage", syncUser);

    return () => {
      window.removeEventListener(AUTH_STORAGE_EVENT, syncUser);
      window.removeEventListener("storage", syncUser);
    };
  }, []);

  return user;
}
