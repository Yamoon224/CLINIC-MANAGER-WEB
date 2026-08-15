"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import * as authApi from "./auth-api";
import type { LoginCredentials, UpdateProfilePayload, User } from "./types";
import { disconnectEcho } from "@/lib/echo";

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (payload: UpdateProfilePayload) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const token = window.localStorage.getItem("auth_token");
    (async () => {
      if (!token) return;
      try {
        setUser(await authApi.fetchCurrentUser());
      } catch {
        window.localStorage.removeItem("auth_token");
      }
    })().finally(() => setIsLoading(false));
  }, []);

  const login = useCallback(
    async (credentials: LoginCredentials) => {
      const { user, token } = await authApi.login(credentials);
      window.localStorage.setItem("auth_token", token);
      setUser(user);
      router.push("/dashboard");
    },
    [router],
  );

  const logout = useCallback(async () => {
    await authApi.logout().catch(() => undefined);
    window.localStorage.removeItem("auth_token");
    disconnectEcho();
    setUser(null);
    router.push("/");
  }, [router]);

  const updateProfile = useCallback(async (payload: UpdateProfilePayload) => {
    setUser(await authApi.updateProfile(payload));
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, isLoading, login, logout, updateProfile }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
