"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import fr from "./fr";
import en from "./en";
import type { Dictionary, Locale } from "./types";

const DICTIONARIES: Record<Locale, Dictionary> = { fr, en };

function resolve(dict: unknown, key: string): unknown {
  return key
    .split(".")
    .reduce<unknown>(
      (acc, part) =>
        acc && typeof acc === "object" ? (acc as Record<string, unknown>)[part] : undefined,
      dict,
    );
}

function interpolate(
  template: string,
  vars?: Record<string, string | number>,
): string {
  if (!vars) return template;
  return template.replace(/\{\{(\w+)\}\}/g, (_, key: string) =>
    String(vars[key] ?? ""),
  );
}

interface LanguageContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string, vars?: Record<string, string | number>) => string;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("fr");

  useEffect(() => {
    const stored = window.localStorage.getItem("locale");
    if (stored === "fr" || stored === "en") setLocaleState(stored);
  }, []);

  function setLocale(next: Locale) {
    setLocaleState(next);
    window.localStorage.setItem("locale", next);
    document.documentElement.setAttribute("lang", next);
  }

  const t = useMemo(() => {
    const dict = DICTIONARIES[locale];
    return (key: string, vars?: Record<string, string | number>) => {
      const value = resolve(dict, key);
      if (typeof value !== "string") return key;
      return interpolate(value, vars);
    };
  }, [locale]);

  return (
    <LanguageContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useTranslation(): LanguageContextValue {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useTranslation must be used within LanguageProvider");
  }
  return context;
}
