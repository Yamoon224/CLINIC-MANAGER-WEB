"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button, Card, Field, Input, Select, Textarea } from "@/components/ui";
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

export function PatientForm() {
  const router = useRouter();
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
      setError("Impossible d'enregistrer le patient. Vérifiez les champs.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Card className="max-w-2xl">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-4">
          <Field label="Nom" required>
            <Input
              required
              placeholder="Ex: Dupont"
              value={form.nom}
              onChange={(e) => update("nom", e.target.value)}
            />
          </Field>
          <Field label="Prénom" required>
            <Input
              required
              placeholder="Ex: Awa"
              value={form.prenom}
              onChange={(e) => update("prenom", e.target.value)}
            />
          </Field>
          <Field label="Date de naissance">
            <Input
              type="date"
              value={form.date_naissance ?? ""}
              onChange={(e) => update("date_naissance", e.target.value)}
            />
          </Field>
          <Field label="Sexe">
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
              <option value="F">Féminin</option>
              <option value="M">Masculin</option>
            </Select>
          </Field>
          <Field label="Téléphone">
            <Input
              placeholder="+225 07 00 00 00 00"
              value={form.telephone ?? ""}
              onChange={(e) => update("telephone", e.target.value)}
            />
          </Field>
          <Field label="Adresse">
            <Input
              placeholder="Quartier, ville..."
              value={form.adresse ?? ""}
              onChange={(e) => update("adresse", e.target.value)}
            />
          </Field>
          <Field label="Personne à prévenir">
            <Input
              placeholder="Nom du contact"
              value={form.personne_a_prevenir_nom ?? ""}
              onChange={(e) => update("personne_a_prevenir_nom", e.target.value)}
            />
          </Field>
          <Field label="Téléphone personne à prévenir">
            <Input
              placeholder="Téléphone du contact"
              value={form.personne_a_prevenir_telephone ?? ""}
              onChange={(e) =>
                update("personne_a_prevenir_telephone", e.target.value)
              }
            />
          </Field>
        </div>

        <Field label="Allergies connues">
          <Textarea
            placeholder="Allergies connues, le cas échéant..."
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

        <Button type="submit" disabled={isSubmitting} className="self-start">
          {isSubmitting ? "Enregistrement..." : "Enregistrer le patient"}
        </Button>
      </form>
    </Card>
  );
}
