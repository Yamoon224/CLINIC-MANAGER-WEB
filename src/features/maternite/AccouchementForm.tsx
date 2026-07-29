"use client";

import { useState } from "react";
import { createAccouchement } from "./maternite-api";
import type { ModeAccouchement } from "./types";
import { Button, Field, Input, Select, Textarea } from "@/components/ui";
import { useTranslation } from "@/lib/i18n/LanguageContext";

export function AccouchementForm({
  grossesseId,
  onSaved,
}: {
  grossesseId: number;
  onSaved: () => void;
}) {
  const { t } = useTranslation();
  const [mode, setMode] = useState<ModeAccouchement>("voie_basse");
  const [dateHeure, setDateHeure] = useState(new Date().toISOString().slice(0, 16));
  const [equipe, setEquipe] = useState("");
  const [complications, setComplications] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setIsSubmitting(true);
    try {
      await createAccouchement(grossesseId, {
        mode,
        date_heure: dateHeure,
        equipe: equipe || undefined,
        complications: complications || undefined,
      });
      onSaved();
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-3 rounded-2xl border border-border bg-surface p-5 shadow-sm"
    >
      <div className="grid grid-cols-2 gap-3">
        <Field label={t("maternite.accouchementForm.mode")}>
          <Select value={mode} onChange={(e) => setMode(e.target.value as ModeAccouchement)}>
            <option value="voie_basse">{t("maternite.accouchementForm.voieBasse")}</option>
            <option value="cesarienne">{t("maternite.accouchementForm.cesarienne")}</option>
          </Select>
        </Field>
        <Field label={t("maternite.accouchementForm.dateHeure")}>
          <Input
            type="datetime-local"
            value={dateHeure}
            onChange={(e) => setDateHeure(e.target.value)}
          />
        </Field>
      </div>
      <Field label={t("maternite.accouchementForm.equipe")}>
        <Input
          placeholder={t("maternite.accouchementForm.equipe")}
          value={equipe}
          onChange={(e) => setEquipe(e.target.value)}
        />
      </Field>
      <Field label={t("maternite.accouchementForm.complications")}>
        <Textarea
          placeholder={t("maternite.accouchementForm.complicationsPlaceholder")}
          value={complications}
          onChange={(e) => setComplications(e.target.value)}
          rows={2}
        />
      </Field>
      <Button type="submit" disabled={isSubmitting} className="self-start">
        {t("maternite.accouchementForm.submit")}
      </Button>
    </form>
  );
}
