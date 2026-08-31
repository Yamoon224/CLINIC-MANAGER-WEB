"use client";

import { useState } from "react";
import { validerBiologiste } from "./laboratoire-api";
import type { DemandeAnalyse } from "./types";
import { Badge, Button, Field, Modal, Textarea } from "@/components/ui";
import { useTranslation } from "@/lib/i18n/LanguageContext";

/**
 * La validation biologiste n'était qu'un simple clic sans aucun moyen de
 * laisser une interprétation pour le médecin prescripteur. Le commentaire
 * est optionnel — un résultat trivial n'a pas besoin d'un mot du biologiste,
 * mais il peut désormais en laisser un quand ça compte.
 */
export function ValiderResultatModal({
  demande,
  onClose,
  onValidated,
}: {
  demande: DemandeAnalyse;
  onClose: () => void;
  onValidated: () => void;
}) {
  const { t } = useTranslation();
  const [commentaire, setCommentaire] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await validerBiologiste(demande.id, commentaire.trim());
      onValidated();
    } catch {
      setError(t("laboratoire.validerModal.error"));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Modal open onClose={onClose} title={t("laboratoire.validerModal.title")} size="sm">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex items-center justify-between rounded-lg border border-border bg-surface px-3 py-2 text-sm">
          <span>
            {demande.analyse_type.nom} : <strong>{demande.resultat_valeur}</strong>{" "}
            {demande.analyse_type.unite}
          </span>
          {demande.resultat_critique && <Badge tone="danger">{t("laboratoire.critique")}</Badge>}
          {!demande.resultat_critique && demande.resultat_anormal && (
            <Badge tone="warning">{t("laboratoire.saisieModal.abnormal")}</Badge>
          )}
        </div>

        {demande.resultat_critique && (
          <p className="rounded-[5px] bg-danger-light px-3 py-2 text-sm text-danger">
            {t("laboratoire.validerModal.criticalNotice")}
          </p>
        )}

        <Field label={t("laboratoire.validerModal.commentaire")}>
          <Textarea
            rows={3}
            value={commentaire}
            onChange={(e) => setCommentaire(e.target.value)}
            placeholder={t("laboratoire.validerModal.commentairePlaceholder")}
          />
        </Field>

        {error && (
          <p className="rounded-[5px] bg-danger-light px-3 py-2 text-sm text-danger">{error}</p>
        )}

        <div className="flex flex-row-reverse justify-start gap-2">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? t("laboratoire.validerModal.submitting") : t("laboratoire.validerModal.submit")}
          </Button>
          <Button type="button" variant="light" onClick={onClose}>
            {t("common.cancel")}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
