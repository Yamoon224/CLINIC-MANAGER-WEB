"use client";

import { useEffect, useRef, useState } from "react";
import { IconChevronDown, IconSearch, IconUser } from "@tabler/icons-react";
import { cn } from "@/lib/cn";
import { useClickOutside } from "@/lib/useClickOutside";
import { useTranslation } from "@/lib/i18n/LanguageContext";
import { searchPatients } from "@/features/patients/patients-api";
import type { Patient } from "@/features/patients/types";
import { Avatar } from "./Avatar";

/* Combobox de recherche patient (type "select2") — recherche serveur debouncée,
   à utiliser partout où l'on choisit un patient. */
export function PatientSelect({
  value,
  onChange,
  placeholder,
  disabled,
  className,
}: {
  value: Patient | null;
  onChange: (patient: Patient | null) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  useClickOutside(ref, () => setOpen(false));

  useEffect(() => {
    if (!open) return;
    requestAnimationFrame(() => searchRef.current?.focus());
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handle = setTimeout(() => {
      setLoading(true);
      searchPatients(query, 1, 10)
        .then((res) => setResults(res.data))
        .finally(() => setLoading(false));
    }, 250);
    return () => clearTimeout(handle);
  }, [query, open]);

  return (
    <div className={cn("relative", className || "w-full")} ref={ref}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-2 rounded-[5px] border border-border bg-surface px-3 py-2 text-left text-sm text-heading outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/15 disabled:opacity-60"
      >
        {value ? (
          <span className="flex min-w-0 items-center gap-2">
            <Avatar
              initials={`${value.prenom.charAt(0)}${value.nom.charAt(0)}`}
              size="xs"
            />
            <span className="truncate">
              {value.prenom} {value.nom}
              <span className="text-muted"> · {value.numero_dossier}</span>
            </span>
          </span>
        ) : (
          <span className="flex items-center gap-2 text-muted">
            <IconUser size={15} />
            {placeholder ?? t("common.datatable.search")}
          </span>
        )}
        <IconChevronDown size={16} className="shrink-0 text-muted" />
      </button>

      {open && (
        <div className="absolute left-0 right-0 z-40 mt-1 overflow-hidden rounded-[5px] border border-border bg-surface shadow-[var(--shadow-preclinic-lg)]">
          <div className="relative border-b border-border">
            <IconSearch
              size={15}
              className="pointer-events-none absolute inset-y-0 left-3 my-auto text-muted"
            />
            <input
              ref={searchRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t("nav.searchPlaceholder")}
              className="w-full bg-surface py-2 pl-9 pr-3 text-sm outline-none"
            />
          </div>
          <ul className="preclinic-scroll max-h-64 overflow-y-auto py-1">
            {value && (
              <li>
                <button
                  type="button"
                  onClick={() => {
                    onChange(null);
                    setOpen(false);
                  }}
                  className="w-full px-3 py-2 text-left text-[13px] text-danger hover:bg-danger-light"
                >
                  {t("rendezvous.form.changePatient")}
                </button>
              </li>
            )}
            {loading && (
              <li className="px-3 py-2 text-sm text-muted">
                {t("common.loading")}
              </li>
            )}
            {!loading && results.length === 0 && (
              <li className="px-3 py-2 text-sm text-muted">
                {t("nav.searchNoResults")}
              </li>
            )}
            {results.map((p) => (
              <li key={p.id}>
                <button
                  type="button"
                  onClick={() => {
                    onChange(p);
                    setOpen(false);
                    setQuery("");
                  }}
                  className={cn(
                    "flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-light",
                    value?.id === p.id && "bg-primary-light text-primary",
                  )}
                >
                  <Avatar
                    initials={`${p.prenom.charAt(0)}${p.nom.charAt(0)}`}
                    size="sm"
                  />
                  <span className="min-w-0">
                    <span className="block truncate font-medium text-heading">
                      {p.prenom} {p.nom}
                    </span>
                    <span className="block text-xs text-muted">
                      {p.numero_dossier}
                      {p.telephone ? ` · ${p.telephone}` : ""}
                    </span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
