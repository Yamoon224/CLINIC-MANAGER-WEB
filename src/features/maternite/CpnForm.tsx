"use client";

import { useState } from "react";
import { addCpn } from "./maternite-api";
import { Button, DateInput, Field, Input, Textarea } from "@/components/ui";
import { useTranslation } from "@/lib/i18n/LanguageContext";

export function CpnForm({
  grossesseId,
  onAdded,
  onCancel,
}: {
  grossesseId: number;
  onAdded: () => void;
  onCancel?: () => void;
}) {
  const { t } = useTranslation();
  const [dateCpn, setDateCpn] = useState(new Date().toISOString().slice(0, 10));
  const [poids, setPoids] = useState("");
  const [tension, setTension] = useState("");
  const [hauteurUterine, setHauteurUterine] = useState("");
  const [bruitsCoeurFoetal, setBruitsCoeurFoetal] = useState("");
  const [risqueDetecte, setRisqueDetecte] = useState(false);
  const [risqueDetails, setRisqueDetails] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setIsSubmitting(true);
    try {
      await addCpn(grossesseId, {
        date_cpn: dateCpn,
        poids: poids ? Number(poids) : undefined,
        tension: tension || undefined,
        hauteur_uterine: hauteurUterine ? Number(hauteurUterine) : undefined,
        bruits_coeur_foetal: bruitsCoeurFoetal || undefined,
        risque_detecte: risqueDetecte,
        risque_details: risqueDetails || undefined,
      });
      setPoids("");
      setTension("");
      setHauteurUterine("");
      setBruitsCoeurFoetal("");
      setRisqueDetecte(false);
      setRisqueDetails("");
      onAdded();
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <div className="grid grid-cols-4 gap-3">
        <Field label={t("maternite.cpnForm.date")}>
          <DateInput value={dateCpn} onChange={(e) => setDateCpn(e.target.value)} />
        </Field>
        <Field label={t("maternite.cpnForm.poids")}>
          <Input
            placeholder={t("maternite.cpnForm.poids")}
            value={poids}
            onChange={(e) => setPoids(e.target.value)}
          />
        </Field>
        <Field label={t("maternite.cpnForm.tension")}>
          <Input
            placeholder={t("maternite.cpnForm.tension")}
            value={tension}
            onChange={(e) => setTension(e.target.value)}
          />
        </Field>
        <Field label={t("maternite.cpnForm.hauteurUterine")}>
          <Input
            placeholder={t("maternite.cpnForm.hauteurUterine")}
            value={hauteurUterine}
            onChange={(e) => setHauteurUterine(e.target.value)}
          />
        </Field>
      </div>
      <Field label={t("maternite.cpnForm.bruitsCoeurFoetal")}>
        <Input
          placeholder={t("maternite.cpnForm.bruitsCoeurFoetal")}
          value={bruitsCoeurFoetal}
          onChange={(e) => setBruitsCoeurFoetal(e.target.value)}
        />
      </Field>
      <label className="flex items-center gap-2 text-sm text-foreground">
        <input
          type="checkbox"
          checked={risqueDetecte}
          onChange={(e) => setRisqueDetecte(e.target.checked)}
          className="h-4 w-4 rounded border-border accent-primary"
        />
        {t("maternite.cpnForm.risqueDetecte")}
      </label>
      {risqueDetecte && (
        <Field label={t("maternite.cpnForm.risqueDetails")}>
          <Textarea
            placeholder={t("maternite.cpnForm.risqueDetails")}
            value={risqueDetails}
            onChange={(e) => setRisqueDetails(e.target.value)}
            rows={2}
          />
        </Field>
      )}
      <div className="flex flex-row-reverse justify-start gap-2">
        <Button type="submit" disabled={isSubmitting}>
          {t("maternite.cpnForm.submit")}
        </Button>
        {onCancel && (
          <Button type="button" variant="light" onClick={onCancel}>
            {t("common.cancel")}
          </Button>
        )}
      </div>
    </form>
  );
}
