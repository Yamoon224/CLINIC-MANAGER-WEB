"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui";
import { useTranslation } from "@/lib/i18n/LanguageContext";
import { useTheme } from "@/lib/theme/ThemeContext";
import type { Locale } from "@/lib/i18n/types";

type Density = "comfortable" | "compact";

export function DisplayPreferences() {
  const { t, locale, setLocale } = useTranslation();
  const { theme, setTheme } = useTheme();
  const [density, setDensity] = useState<Density>("comfortable");

  useEffect(() => {
    const stored = window.localStorage.getItem("density");
    if (stored === "compact") setDensity("compact");
  }, []);

  function applyDensity(value: Density) {
    setDensity(value);
    window.localStorage.setItem("density", value);
    document.documentElement.setAttribute(
      "data-density",
      value === "compact" ? "compact" : "",
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <h3 className="text-sm font-semibold">
          {t("parametres.display.densityTitle")}
        </h3>
        <p className="mt-1 text-sm text-muted">
          {t("parametres.display.densitySubtitle")}
        </p>
        <div className="mt-4 flex gap-3">
          {(["comfortable", "compact"] as const).map((option) => (
            <button
              key={option}
              onClick={() => applyDensity(option)}
              className={`flex-1 border px-4 py-3 text-sm font-medium transition-colors ${
                density === option
                  ? "border-primary bg-primary-light text-primary"
                  : "border-border text-muted hover:bg-primary-light/40"
              }`}
            >
              {t(`parametres.display.${option}`)}
            </button>
          ))}
        </div>
      </Card>

      <Card>
        <h3 className="text-sm font-semibold">
          {t("parametres.display.themeTitle")}
        </h3>
        <p className="mt-1 text-sm text-muted">
          {t("parametres.display.themeSubtitle")}
        </p>
        <div className="mt-4 flex gap-3">
          {(["light", "dark"] as const).map((option) => (
            <button
              key={option}
              onClick={() => setTheme(option)}
              className={`flex-1 border px-4 py-3 text-sm font-medium transition-colors ${
                theme === option
                  ? "border-primary bg-primary-light text-primary"
                  : "border-border text-muted hover:bg-primary-light/40"
              }`}
            >
              {t(`parametres.display.theme${option === "light" ? "Light" : "Dark"}`)}
            </button>
          ))}
        </div>
      </Card>

      <Card>
        <h3 className="text-sm font-semibold">
          {t("parametres.display.languageTitle")}
        </h3>
        <p className="mt-1 text-sm text-muted">
          {t("parametres.display.languageSubtitle")}
        </p>
        <div className="mt-4 flex gap-3">
          {(
            [
              { code: "fr", label: "Français" },
              { code: "en", label: "English" },
            ] as { code: Locale; label: string }[]
          ).map((option) => (
            <button
              key={option.code}
              onClick={() => setLocale(option.code)}
              className={`flex-1 border px-4 py-3 text-sm font-medium transition-colors ${
                locale === option.code
                  ? "border-primary bg-primary-light text-primary"
                  : "border-border text-muted hover:bg-primary-light/40"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </Card>
    </div>
  );
}
