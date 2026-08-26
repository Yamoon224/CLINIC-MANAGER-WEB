"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { searchPatients } from "@/features/patients/patients-api";
import type { Patient } from "@/features/patients/types";
import { useClickOutside } from "@/lib/useClickOutside";
import { useTranslation } from "@/lib/i18n/LanguageContext";

/**
 * Patient-only for now — patients are the entity every other module hangs
 * off of, and the one staff actually reach for from anywhere in the app.
 * Extend to factures/rendez-vous if that need comes up.
 */
export function GlobalSearch() {
  const { t } = useTranslation();
  const router = useRouter();
  const ref = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Patient[]>([]);
  const [open, setOpen] = useState(false);
  useClickOutside(ref, () => setOpen(false));

  useEffect(() => {
    const handle = setTimeout(() => {
      if (!query.trim()) {
        setResults([]);
        return;
      }
      searchPatients(query).then((res) => setResults(res.data.slice(0, 6)));
    }, 250);
    return () => clearTimeout(handle);
  }, [query]);

  function goTo(patient: Patient) {
    router.push(`/patients/${patient.id}`);
    setQuery("");
    setResults([]);
    setOpen(false);
  }

  return (
    <div className="relative w-full max-w-sm" ref={ref}>
      <div className="flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-1.5 text-sm focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20">
        <Search size={16} className="shrink-0 text-muted" />
        <input
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={(e) => {
            if (e.key === "Escape") setOpen(false);
          }}
          placeholder={t("nav.searchPlaceholder")}
          className="w-full bg-transparent text-foreground outline-none placeholder:text-muted"
        />
      </div>

      {open && query.trim() && (
        <div className="absolute left-0 right-0 z-40 mt-1 max-h-80 overflow-y-auto rounded-lg border border-border bg-surface shadow-lg">
          {results.length === 0 && (
            <p className="px-3 py-3 text-center text-sm text-muted">{t("nav.searchNoResults")}</p>
          )}
          {results.map((patient) => (
            <button
              key={patient.id}
              type="button"
              onClick={() => goTo(patient)}
              className="flex w-full flex-col items-start gap-0.5 border-b border-border px-3 py-2 text-left text-sm last:border-0 hover:bg-primary-light/40"
            >
              <span className="font-medium text-foreground">
                {patient.prenom} {patient.nom}
              </span>
              <span className="text-xs text-muted">{patient.numero_dossier}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
