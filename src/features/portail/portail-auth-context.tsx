"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import * as portailApi from "./portail-api";
import type { PortailLoginCredentials, PortailPatient } from "./types";

interface PortailAuthContextValue {
  patient: PortailPatient | null;
  isLoading: boolean;
  login: (credentials: PortailLoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
}

const PortailAuthContext = createContext<PortailAuthContextValue | null>(null);

export function PortailAuthProvider({ children }: { children: React.ReactNode }) {
  const [patient, setPatient] = useState<PortailPatient | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const token = window.localStorage.getItem("portail_token");
    (async () => {
      if (!token) return;
      try {
        setPatient(await portailApi.fetchPortailMe());
      } catch {
        window.localStorage.removeItem("portail_token");
      }
    })().finally(() => setIsLoading(false));
  }, []);

  const login = useCallback(
    async (credentials: PortailLoginCredentials) => {
      const { patient, token } = await portailApi.portailLogin(credentials);
      window.localStorage.setItem("portail_token", token);
      setPatient(patient);
      router.push("/portail/rendez-vous");
    },
    [router],
  );

  const logout = useCallback(async () => {
    await portailApi.portailLogout().catch(() => undefined);
    window.localStorage.removeItem("portail_token");
    setPatient(null);
    router.push("/portail");
  }, [router]);

  return (
    <PortailAuthContext.Provider value={{ patient, isLoading, login, logout }}>
      {children}
    </PortailAuthContext.Provider>
  );
}

export function usePortailAuth(): PortailAuthContextValue {
  const context = useContext(PortailAuthContext);
  if (!context) throw new Error("usePortailAuth must be used within PortailAuthProvider");
  return context;
}
