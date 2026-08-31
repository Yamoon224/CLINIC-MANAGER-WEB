"use client";

import { IconMoon, IconSun } from "@tabler/icons-react";
import { useTheme } from "@/lib/theme/ThemeContext";
import { useTranslation } from "@/lib/i18n/LanguageContext";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const { t } = useTranslation();

  const label =
    theme === "light"
      ? t("parametres.display.themeDark")
      : t("parametres.display.themeLight");

  return (
    <button
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
      aria-label={label}
      title={label}
      className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-border text-muted shadow-[var(--shadow-preclinic-sm)] transition-colors hover:border-primary hover:text-primary"
    >
      {theme === "light" ? <IconMoon size={16} /> : <IconSun size={16} />}
    </button>
  );
}
