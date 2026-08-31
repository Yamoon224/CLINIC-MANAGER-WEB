"use client";

import { useState } from "react";
import { saisirResultat } from "./laboratoire-api";
import type { DemandeAnalyse } from "./types";
import { Button, Field, Input, Modal } from "@/components/ui";
import { useTranslation } from "@/lib/i18n/LanguageContext";

/**
 * Remplace l'ancien champ texte de 96px encastré dans la ligne du worklist
 * (le laborantin devait connaître les seuils par cœur). Affiche l'unité, la
 * plage de référence numérique quand elle existe, et les mots-clés
 * anormal/critique pour les analyses qualitatives (sérologies, examens
 * microbio...) qui n'ont pas de plage numérique — voir
 * AnalyseType::valeurs_anormales / valeurs_critiques.
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
  const [valeur, setValeur] = useState(demande.resultat_valeur ?? "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { analyse_type: analyseType } = demande;
  const hasNumericRange =
    analyseType.valeur_ref_min !== null || analyseType.valeur_ref_max !== null;
  const hasQualitativeKeywords =
    Boolean(analyseType.valeurs_anormales) || Boolean(analyseType.valeurs_critiques);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!valeur.trim()) return;
    setError(null);
    setIsSubmitting(true);
    try {
      await saisirResultat(demande.id, valeur.trim());
      onSaved();
    } catch {
      setError(t("laboratoire.saisieModal.error"));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Modal open onClose={onClose} title={analyseType.nom} size="sm">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <dl className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-sm">
          {analyseType.prelevement && (
            <>
              <dt className="text-muted">{t("laboratoire.saisieModal.prelevement")}</dt>
              <dd className="text-foreground">{analyseType.prelevement}</dd>
            </>
          )}
          {hasNumericRange && (
            <>
              <dt className="text-muted">{t("laboratoire.saisieModal.refRange")}</dt>
              <dd className="text-foreground">
                {analyseType.valeur_ref_min ?? "–"} – {analyseType.valeur_ref_max ?? "–"}{" "}
                {analyseType.unite}
              </dd>
            </>
          )}
          {(analyseType.valeur_critique_min !== null || analyseType.valeur_critique_max !== null) && (
            <>
              <dt className="text-muted">{t("laboratoire.saisieModal.criticalRange")}</dt>
              <dd className="text-danger">
                &lt; {analyseType.valeur_critique_min ?? "–"} {t("common.or")} &gt;{" "}
                {analyseType.valeur_critique_max ?? "–"} {analyseType.unite}
              </dd>
            </>
          )}
          {hasQualitativeKeywords && (
            <>
              <dt className="text-muted">{t("laboratoire.saisieModal.qualitativeHint")}</dt>
              <dd className="text-foreground">
                {analyseType.valeurs_critiques && (
                  <span className="text-danger">
                    {t("laboratoire.saisieModal.critical")}: {analyseType.valeurs_critiques}
                  </span>
                )}
                {analyseType.valeurs_critiques && analyseType.valeurs_anormales && " · "}
                {analyseType.valeurs_anormales && (
                  <span className="text-warning">
                    {t("laboratoire.saisieModal.abnormal")}: {analyseType.valeurs_anormales}
                  </span>
                )}
              </dd>
            </>
          )}
        </dl>

        <Field label={t("laboratoire.saisieModal.valeur")}>
          <div className="flex items-center gap-2">
            <Input
              autoFocus
              value={valeur}
              onChange={(e) => setValeur(e.target.value)}
              placeholder={t("laboratoire.valeurPlaceholder")}
            />
            {analyseType.unite && <span className="text-sm text-muted">{analyseType.unite}</span>}
          </div>
        </Field>

        {error && (
          <p className="rounded-[5px] bg-danger-light px-3 py-2 text-sm text-danger">{error}</p>
        )}

        <div className="flex flex-row-reverse justify-start gap-2">
          <Button type="submit" disabled={isSubmitting || !valeur.trim()}>
            {isSubmitting ? t("laboratoire.saisieModal.submitting") : t("laboratoire.saisieModal.submit")}
          </Button>
          <Button type="button" variant="light" onClick={onClose}>
            {t("common.cancel")}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
