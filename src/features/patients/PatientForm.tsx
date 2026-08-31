"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  Button,
  Card,
  DateInput,
  Field,
  FormSection,
  Input,
  Select,
  Textarea,
} from "@/components/ui";
import { useTranslation } from "@/lib/i18n/LanguageContext";
import { registerPatient, updatePatient } from "./patients-api";
import type { Patient, RegisterPatientPayload } from "./types";

const EMPTY_FORM: RegisterPatientPayload = {
  nom: "",
  prenom: "",
  date_naissance: "",
  sexe: undefined,
  telephone: "",
  adresse: "",
  personne_a_prevenir_nom: "",
  personne_a_prevenir_telephone: "",
  piece_identite_type: "",
  piece_identite_numero: "",
  assurance_nom: "",
  assurance_numero: "",
  allergies: "",
  antecedents: "",
};

function fromPatient(p: Patient): RegisterPatientPayload {
  return {
    nom: p.nom,
    prenom: p.prenom,
    date_naissance: p.date_naissance ?? "",
    sexe: p.sexe ?? undefined,
    telephone: p.telephone ?? "",
    adresse: p.adresse ?? "",
    personne_a_prevenir_nom: p.personne_a_prevenir_nom ?? "",
    personne_a_prevenir_telephone: p.personne_a_prevenir_telephone ?? "",
    piece_identite_type: p.piece_identite_type ?? "",
    piece_identite_numero: p.piece_identite_numero ?? "",
    assurance_nom: p.assurance_nom ?? "",
    assurance_numero: p.assurance_numero ?? "",
    allergies: p.allergies ?? "",
    antecedents: p.antecedents ?? "",
  };
}

export function PatientForm({
  patient,
  onCancel,
  onSaved,
  compact = false,
}: {
  /** Fourni = mode édition. */
  patient?: Patient;
  onCancel?: () => void;
  onSaved?: (patient: Patient) => void;
  /** true = formulaire à plat (usage en modale), sans cartes de section. */
  compact?: boolean;
}) {
  const router = useRouter();
  const { t } = useTranslation();
  const [form, setForm] = useState<RegisterPatientPayload>(
    patient ? fromPatient(patient) : EMPTY_FORM,
  );
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
      const { data } = patient
        ? await updatePatient(patient.id, form)
        : await registerPatient(form);
      if (onSaved) onSaved(data);
      else router.push(`/patients/${data.id}`);
    } catch {
      setError(t("patients.form.error"));
    } finally {
      setIsSubmitting(false);
    }
  }

  const identity = (
    <div className="grid gap-4 sm:grid-cols-2">
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
        <DateInput
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
    </div>
  );

  const contact = (
    <div className="grid gap-4 sm:grid-cols-2">
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
    </div>
  );

  const emergency = (
    <div className="grid gap-4 sm:grid-cols-2">
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
  );

  const medical = (
    <Field label={t("patients.form.allergies")}>
      <Textarea
        placeholder={t("patients.form.allergiesPlaceholder")}
        value={form.allergies ?? ""}
        onChange={(e) => update("allergies", e.target.value)}
        rows={2}
      />
    </Field>
  );

  const footer = (
    <>
      {error && (
        <p className="rounded-[5px] bg-danger-light px-3 py-2 text-sm text-danger">
          {error}
        </p>
      )}
      <div className="flex justify-end gap-2">
        {onCancel && (
          <Button type="button" variant="light" onClick={onCancel}>
            {t("common.cancel")}
          </Button>
        )}
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting
            ? t("patients.form.submitting")
            : patient
              ? t("common.save")
              : t("patients.form.submit")}
        </Button>
      </div>
    </>
  );

  if (compact) {
    return (
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {identity}
        {contact}
        {emergency}
        {medical}
        {footer}
      </form>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Card>
        <FormSection title={t("patients.form.sections.identity")}>{identity}</FormSection>
        <FormSection title={t("patients.form.sections.contact")}>{contact}</FormSection>
        <FormSection title={t("patients.form.sections.emergency")}>
          {emergency}
        </FormSection>
        <FormSection title={t("patients.form.sections.medical")}>{medical}</FormSection>
      </Card>
      {footer}
    </form>
  );
}
