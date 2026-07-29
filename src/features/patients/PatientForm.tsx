"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
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
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 max-w-2xl">
      <div className="grid grid-cols-2 gap-4">
        <Field label="Nom" required>
          <input
            required
            value={form.nom}
            onChange={(e) => update("nom", e.target.value)}
            className="border rounded px-3 py-2 w-full"
          />
        </Field>
        <Field label="Prénom" required>
          <input
            required
            value={form.prenom}
            onChange={(e) => update("prenom", e.target.value)}
            className="border rounded px-3 py-2 w-full"
          />
        </Field>
        <Field label="Date de naissance">
          <input
            type="date"
            value={form.date_naissance ?? ""}
            onChange={(e) => update("date_naissance", e.target.value)}
            className="border rounded px-3 py-2 w-full"
          />
        </Field>
        <Field label="Sexe">
          <select
            value={form.sexe ?? ""}
            onChange={(e) =>
              update(
                "sexe",
                e.target.value === "" ? undefined : (e.target.value as "M" | "F"),
              )
            }
            className="border rounded px-3 py-2 w-full"
          >
            <option value="">-</option>
            <option value="F">Féminin</option>
            <option value="M">Masculin</option>
          </select>
        </Field>
        <Field label="Téléphone">
          <input
            value={form.telephone ?? ""}
            onChange={(e) => update("telephone", e.target.value)}
            className="border rounded px-3 py-2 w-full"
          />
        </Field>
        <Field label="Adresse">
          <input
            value={form.adresse ?? ""}
            onChange={(e) => update("adresse", e.target.value)}
            className="border rounded px-3 py-2 w-full"
          />
        </Field>
        <Field label="Personne à prévenir">
          <input
            value={form.personne_a_prevenir_nom ?? ""}
            onChange={(e) => update("personne_a_prevenir_nom", e.target.value)}
            className="border rounded px-3 py-2 w-full"
          />
        </Field>
        <Field label="Téléphone personne à prévenir">
          <input
            value={form.personne_a_prevenir_telephone ?? ""}
            onChange={(e) =>
              update("personne_a_prevenir_telephone", e.target.value)
            }
            className="border rounded px-3 py-2 w-full"
          />
        </Field>
      </div>

      <Field label="Allergies connues">
        <textarea
          value={form.allergies ?? ""}
          onChange={(e) => update("allergies", e.target.value)}
          className="border rounded px-3 py-2 w-full"
          rows={2}
        />
      </Field>

      {error && <p className="text-red-600 text-sm">{error}</p>}

      <button
        type="submit"
        disabled={isSubmitting}
        className="bg-blue-600 text-white rounded px-3 py-2 self-start disabled:opacity-50"
      >
        {isSubmitting ? "Enregistrement..." : "Enregistrer le patient"}
      </button>
    </form>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1 text-sm">
      <span>
        {label}
        {required && <span className="text-red-600"> *</span>}
      </span>
      {children}
    </label>
  );
}
