"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/lib/theme/ThemeContext";
import { useTranslation } from "@/lib/i18n/LanguageContext";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const { t } = useTranslation();

  function toggle() {
    setTheme(theme === "light" ? "dark" : "light");
  }

  const label =
    theme === "light"
      ? t("parametres.display.themeDark")
      : t("parametres.display.themeLight");

  return (
    <button
      onClick={toggle}
      aria-label={label}
      title={label}
      className="rounded-full p-2 text-muted hover:bg-primary-light hover:text-primary"
    >
      {theme === "light" ? <Moon size={20} /> : <Sun size={20} />}
    </button>
  );
}
