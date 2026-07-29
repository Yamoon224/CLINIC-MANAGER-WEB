"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui";

type Density = "comfortable" | "compact";

export function DisplayPreferences() {
  const [density, setDensity] = useState<Density>("comfortable");

  useEffect(() => {
    const stored = window.localStorage.getItem("density");
    if (stored === "compact") setDensity("compact");
  }, []);

  function apply(value: Density) {
    setDensity(value);
    window.localStorage.setItem("density", value);
    document.documentElement.setAttribute(
      "data-density",
      value === "compact" ? "compact" : "",
    );
  }

  return (
    <Card className="max-w-lg">
      <h3 className="text-sm font-semibold">Densité d&apos;affichage</h3>
      <p className="mt-1 text-sm text-muted">
        Ajustez la compacité de l&apos;interface selon votre préférence.
      </p>
      <div className="mt-4 flex gap-3">
        {(["comfortable", "compact"] as const).map((option) => (
          <button
            key={option}
            onClick={() => apply(option)}
            className={`flex-1 rounded-lg border px-4 py-3 text-sm font-medium transition-colors ${
              density === option
                ? "border-primary bg-primary-light text-primary"
                : "border-border text-muted hover:bg-primary-light/40"
            }`}
          >
            {option === "comfortable" ? "Confortable" : "Compact"}
          </button>
        ))}
      </div>
    </Card>
  );
}
