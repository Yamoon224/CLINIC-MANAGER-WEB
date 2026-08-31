"use client";

import { useState } from "react";
import { addNouveauNe } from "./maternite-api";
import { Button, Field, Input, Select } from "@/components/ui";
import { useTranslation } from "@/lib/i18n/LanguageContext";

export function NouveauNeForm({
  accouchementId,
  onAdded,
  onCancel,
}: {
  accouchementId: number;
  onAdded: () => void;
  onCancel?: () => void;
}) {
  const { t } = useTranslation();
  const [sexe, setSexe] = useState<"M" | "F" | "">("");
  const [poids, setPoids] = useState("");
  const [taille, setTaille] = useState("");
  const [apgar1, setApgar1] = useState("");
  const [apgar5, setApgar5] = useState("");
  const [vaccinations, setVaccinations] = useState("BCG, Polio 0");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setIsSubmitting(true);
    try {
      await addNouveauNe(accouchementId, {
        sexe: sexe || undefined,
        poids: poids ? Number(poids) : undefined,
        taille: taille ? Number(taille) : undefined,
        score_apgar_1min: apgar1 ? Number(apgar1) : undefined,
        score_apgar_5min: apgar5 ? Number(apgar5) : undefined,
        vaccinations_naissance: vaccinations || undefined,
      });
      onAdded();
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <div className="grid grid-cols-3 gap-3">
        <Field label={t("maternite.nouveauNeForm.sexe")}>
          <Select value={sexe} onChange={(e) => setSexe(e.target.value as "M" | "F" | "")}>
            <option value="">{t("maternite.nouveauNeForm.sexe")}</option>
            <option value="F">{t("maternite.nouveauNeForm.sexeFeminin")}</option>
            <option value="M">{t("maternite.nouveauNeForm.sexeMasculin")}</option>
          </Select>
        </Field>
        <Field label={t("maternite.nouveauNeForm.poidsKg")}>
          <Input
            placeholder={t("maternite.nouveauNeForm.poidsKg")}
            value={poids}
            onChange={(e) => setPoids(e.target.value)}
          />
        </Field>
        <Field label={t("maternite.nouveauNeForm.tailleCm")}>
          <Input
            placeholder={t("maternite.nouveauNeForm.tailleCm")}
            value={taille}
            onChange={(e) => setTaille(e.target.value)}
          />
        </Field>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Field label={t("maternite.nouveauNeForm.apgar1")}>
          <Input
            placeholder={t("maternite.nouveauNeForm.apgar1")}
            value={apgar1}
            onChange={(e) => setApgar1(e.target.value)}
          />
        </Field>
        <Field label={t("maternite.nouveauNeForm.apgar5")}>
          <Input
            placeholder={t("maternite.nouveauNeForm.apgar5")}
            value={apgar5}
            onChange={(e) => setApgar5(e.target.value)}
          />
        </Field>
      </div>
      <Field label={t("maternite.nouveauNeForm.vaccinations")}>
        <Input
          placeholder={t("maternite.nouveauNeForm.vaccinations")}
          value={vaccinations}
          onChange={(e) => setVaccinations(e.target.value)}
        />
      </Field>
      <div className="flex gap-2">
        <Button type="submit" disabled={isSubmitting}>
          {t("maternite.nouveauNeForm.submit")}
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
