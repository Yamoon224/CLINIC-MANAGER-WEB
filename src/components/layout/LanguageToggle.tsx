"use client";

import { IconWorld } from "@tabler/icons-react";
import { useTranslation } from "@/lib/i18n/LanguageContext";

export function LanguageToggle() {
  const { locale, setLocale } = useTranslation();

  return (
    <button
      onClick={() => setLocale(locale === "fr" ? "en" : "fr")}
      aria-label={locale === "fr" ? "Switch to English" : "Passer en français"}
      title={locale === "fr" ? "Switch to English" : "Passer en français"}
      className="inline-flex h-8 items-center gap-1 rounded-full border border-border px-2 text-muted shadow-[var(--shadow-preclinic-sm)] transition-colors hover:border-primary hover:text-primary"
    >
      <IconWorld size={16} />
      <span className="text-[11px] font-semibold uppercase">{locale}</span>
    </button>
  );
}
