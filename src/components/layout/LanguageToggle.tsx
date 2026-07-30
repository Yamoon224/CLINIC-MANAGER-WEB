"use client";

import { Languages } from "lucide-react";
import { useTranslation } from "@/lib/i18n/LanguageContext";

export function LanguageToggle() {
  const { locale, setLocale } = useTranslation();

  function toggle() {
    setLocale(locale === "fr" ? "en" : "fr");
  }

  return (
    <button
      onClick={toggle}
      aria-label={locale === "fr" ? "Switch to English" : "Passer en français"}
      title={locale === "fr" ? "Switch to English" : "Passer en français"}
      className="flex items-center gap-1 rounded-full px-2 py-2 text-muted hover:bg-primary-light hover:text-primary"
    >
      <Languages size={20} />
      <span className="text-xs font-semibold uppercase">{locale}</span>
    </button>
  );
}
