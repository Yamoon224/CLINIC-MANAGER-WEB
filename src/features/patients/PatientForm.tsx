"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button, Field, Input, Select, Textarea } from "@/components/ui";
import { useTranslation } from "@/lib/i18n/LanguageContext";
import { registerPatient } from "./patients-api";
import type { RegisterPatientPayload } from "./types";

const EMPTY_FORM: RegisterPatientPayload = {
  nom: "",
  prenom: "",
  date_naissance: "",
  sexe: undefined,
  telephone: "",
  adresse: "",
  personne_a_prevenir_nom: "",
  personne_a_prevenir_telephone: "",
  allergies: "",
};

export function PatientForm({ onCancel }: { onCancel?: () => void }) {
  const router = useRouter();
  const { t } = useTranslation();
  const [form, setForm] = useState<RegisterPatientPayload>(EMPTY_FORM);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function update<K extends keyof RegisterPatientPayload>(
    field: K,
    value: RegisterPatientPayload[K],
  ) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      const { data } = await registerPatient(form);
      router.push(`/patients/${data.id}`);
    } catch {
      setError(t("patients.form.error"));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-4">
          <Field label={t("patients.form.nom")} required>
            <Input
              required
              placeholder={t("patients.form.nomPlaceholder")}
              value={form.nom}
              onChange={(e) => update("nom", e.target.value)}
            />
          </Field>
          <Field label={t("patients.form.prenom")} required>
            <Input
              required
              placeholder={t("patients.form.prenomPlaceholder")}
              value={form.prenom}
              onChange={(e) => update("prenom", e.target.value)}
            />
          </Field>
          <Field label={t("patients.form.dateNaissance")}>
            <Input
              type="date"
              value={form.date_naissance ?? ""}
              onChange={(e) => update("date_naissance", e.target.value)}
            />
          </Field>
          <Field label={t("patients.form.sexe")}>
            <Select
              value={form.sexe ?? ""}
              onChange={(e) =>
                update(
                  "sexe",
                  e.target.value === "" ? undefined : (e.target.value as "M" | "F"),
                )
              }
            >
              <option value="">-</option>
              <option value="F">{t("patients.form.sexeFeminin")}</option>
              <option value="M">{t("patients.form.sexeMasculin")}</option>
            </Select>
          </Field>
          <Field label={t("patients.form.telephone")}>
            <Input
              placeholder={t("patients.form.telephonePlaceholder")}
              value={form.telephone ?? ""}
              onChange={(e) => update("telephone", e.target.value)}
            />
          </Field>
          <Field label={t("patients.form.adresse")}>
            <Input
              placeholder={t("patients.form.adressePlaceholder")}
              value={form.adresse ?? ""}
              onChange={(e) => update("adresse", e.target.value)}
            />
          </Field>
          <Field label={t("patients.form.personneAPrevenir")}>
            <Input
              placeholder={t("patients.form.personneAPrevenirPlaceholder")}
              value={form.personne_a_prevenir_nom ?? ""}
              onChange={(e) => update("personne_a_prevenir_nom", e.target.value)}
            />
          </Field>
          <Field label={t("patients.form.telephonePersonneAPrevenir")}>
            <Input
              placeholder={t("patients.form.telephonePersonneAPrevenirPlaceholder")}
              value={form.personne_a_prevenir_telephone ?? ""}
              onChange={(e) =>
                update("personne_a_prevenir_telephone", e.target.value)
              }
            />
          </Field>
        </div>

        <Field label={t("patients.form.allergies")}>
          <Textarea
            placeholder={t("patients.form.allergiesPlaceholder")}
            value={form.allergies ?? ""}
            onChange={(e) => update("allergies", e.target.value)}
            rows={2}
          />
        </Field>

        {error && (
          <p className="rounded-lg bg-danger-light px-3 py-2 text-sm text-danger">
            {error}
          </p>
        )}

        <div className="flex gap-2">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? t("patients.form.submitting") : t("patients.form.submit")}
          </Button>
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              {t("common.cancel")}
            </Button>
          )}
        </div>
    </form>
  );
}
