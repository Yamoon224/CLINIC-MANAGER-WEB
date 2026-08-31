"use client";

import { useState } from "react";
import { saisirResultat, saisirResultats } from "./laboratoire-api";
import type { AnalyseParametre, DemandeAnalyse } from "./types";
import { Button, Field, Input, Modal } from "@/components/ui";
import { useTranslation } from "@/lib/i18n/LanguageContext";

function refHint(p: AnalyseParametre): string | null {
  if (p.valeur_ref_min !== null || p.valeur_ref_max !== null) {
    return `${p.valeur_ref_min ?? "–"} – ${p.valeur_ref_max ?? "–"}${
      p.unite ? ` ${p.unite}` : ""
    }`;
  }
  if (p.valeurs_critiques || p.valeurs_anormales) {
    return [
      p.valeurs_critiques && `⚠ ${p.valeurs_critiques}`,
      p.valeurs_anormales && p.valeurs_anormales,
    ]
      .filter(Boolean)
      .join(" · ");
  }
  return null;
}

/**
 * Saisie / correction des résultats d'une demande — un champ par paramètre
 * mesuré (un examen simple n'en a qu'un). Le worklist reste la voie « ligne
 * par ligne » ; la saisie groupée d'une consultation passe par la feuille de
 * résultats.
 */
export function SaisirResultatModal({
  demande,
  onClose,
  onSaved,
}: {
  demande: DemandeAnalyse;
  onClose: () => void;
  onSaved: () => void;
}) {
  const { t } = useTranslation();
  const parametres = demande.analyse_type.parametres ?? [];
  const resultatsExistants = new Map(
    (demande.resultats ?? []).map((r) => [r.analyse_parametre_id, r.valeur ?? ""]),
  );
  const [values, setValues] = useState<Record<number, string>>(
    Object.fromEntries(
      parametres.map((p) => [p.id, resultatsExistants.get(p.id) ?? ""]),
    ),
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const hasAny = Object.values(values).some((v) => v.trim() !== "");

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!hasAny) return;
    setError(null);
    setIsSubmitting(true);
    try {
      const filled = parametres
        .filter((p) => (values[p.id] ?? "").trim() !== "")
        .map((p) => ({
          analyse_parametre_id: p.id,
          valeur: values[p.id].trim(),
        }));

      if (filled.length === 1 && parametres.length === 1) {
        await saisirResultat(demande.id, filled[0].valeur);
      } else {
        await saisirResultats(demande.id, filled);
      }
      onSaved();
    } catch {
      setError(t("laboratoire.saisieModal.error"));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Modal open onClose={onClose} title={demande.analyse_type.nom} size="sm">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {demande.analyse_type.prelevement && (
          <p className="text-sm text-muted">
            {t("laboratoire.saisieModal.prelevement")}:{" "}
            {demande.analyse_type.prelevement}
          </p>
        )}

        {parametres.map((p) => {
          const hint = refHint(p);
          return (
            <Field
              key={p.id}
              label={
                parametres.length > 1
                  ? p.nom
                  : t("laboratoire.saisieModal.valeur")
              }
            >
              <div className="flex items-center gap-2">
                <Input
                  autoFocus={parametres[0]?.id === p.id}
                  value={values[p.id] ?? ""}
                  onChange={(e) =>
                    setValues((prev) => ({ ...prev, [p.id]: e.target.value }))
                  }
                  placeholder={t("laboratoire.valeurPlaceholder")}
                />
                {p.unite && (
                  <span className="text-sm text-muted">{p.unite}</span>
                )}
              </div>
              {hint && (
                <p className="m-0 mt-1 text-xs text-muted">
                  {t("laboratoire.saisieModal.refRange")}: {hint}
                </p>
              )}
            </Field>
          );
        })}

        {error && (
          <p className="rounded-[5px] bg-danger-light px-3 py-2 text-sm text-danger">
            {error}
          </p>
        )}

        <div className="flex flex-row-reverse justify-start gap-2">
          <Button type="submit" disabled={isSubmitting || !hasAny}>
            {isSubmitting
              ? t("laboratoire.saisieModal.submitting")
              : t("laboratoire.saisieModal.submit")}
          </Button>
          <Button type="button" variant="light" onClick={onClose}>
            {t("common.cancel")}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
