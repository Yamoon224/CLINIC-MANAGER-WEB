"use client";

import { useEffect, useState } from "react";
import { Select } from "@/components/ui";
import { useAuth } from "@/features/auth/auth-context";
import { useTranslation } from "@/lib/i18n/LanguageContext";
import { fetchDentistes } from "./dentaire-api";
import type { Dentiste } from "./types";

/* Choix du praticien d'un document dentaire. Valeur null = l'utilisateur
   connecté (cas du dentiste qui saisit pour lui-même) ; la liste permet au
   secrétariat de saisir au nom d'un dentiste du cabinet. */
export function PraticienSelect({
  value,
  onChange,
}: {
  value: number | null;
  onChange: (praticienId: number | null) => void;
}) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [dentistes, setDentistes] = useState<Dentiste[]>([]);

  useEffect(() => {
    fetchDentistes()
      .then((res) => setDentistes(res.data))
      .catch(() => setDentistes([]));
  }, []);

  return (
    <Select
      value={value ?? ""}
      onChange={(e) => onChange(e.target.value === "" ? null : Number(e.target.value))}
    >
      <option value="">{t("dentaire.common.praticienMoi")}</option>
      {dentistes
        .filter((d) => d.id !== user?.id)
        .map((d) => (
          <option key={d.id} value={d.id}>
            {d.name}
          </option>
        ))}
    </Select>
  );
}
