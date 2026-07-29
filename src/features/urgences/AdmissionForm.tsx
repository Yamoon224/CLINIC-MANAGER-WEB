"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { searchPatients } from "@/features/patients/patients-api";
import type { Patient } from "@/features/patients/types";
import { Button, Card, Field, Input, Textarea } from "@/components/ui";
import { admettre } from "./urgences-api";

export function AdmissionForm() {
  const router = useRouter();

  const [patientQuery, setPatientQuery] = useState("");
  const [patientResults, setPatientResults] = useState<Patient[]>([]);
  const [patient, setPatient] = useState<Patient | null>(null);

  const [nom, setNom] = useState("");
  const [prenom, setPrenom] = useState("");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handle = setTimeout(() => {
      if (!patientQuery) {
        setPatientResults([]);
        return;
      }
      searchPatients(patientQuery).then((res) => setPatientResults(res.data));
    }, 250);
    return () => clearTimeout(handle);
  }, [patientQuery]);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      const { data } = await admettre({
        patient_id: patient?.id,
        nom: patient ? undefined : nom || undefined,
        prenom: patient ? undefined : prenom || undefined,
        notes: notes || undefined,
      });
      router.push(`/urgences/${data.id}`);
    } catch {
      setError("Impossible d'admettre le patient.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Card className="max-w-xl">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <p className="text-sm text-muted">
          Patient inconnu ou inconscient ? Laissez la recherche vide et
          validez directement - un dossier minimal sera créé.
        </p>

        <Field label="Patient déjà connu (optionnel)">
          {patient ? (
            <div className="flex items-center justify-between rounded-lg border border-border bg-surface px-3 py-2 text-sm">
              <span>
                {patient.prenom} {patient.nom} ({patient.numero_dossier})
              </span>
              <button
                type="button"
                onClick={() => setPatient(null)}
                className="text-sm text-primary hover:underline"
              >
                Changer
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-1.5">
              <Input
                placeholder="Rechercher un patient..."
                value={patientQuery}
                onChange={(e) => setPatientQuery(e.target.value)}
              />
              {patientResults.length > 0 && (
                <ul className="rounded-lg border border-border divide-y divide-border overflow-hidden">
                  {patientResults.map((p) => (
                    <li key={p.id}>
                      <button
                        type="button"
                        onClick={() => {
                          setPatient(p);
                          setPatientResults([]);
                          setPatientQuery("");
                        }}
                        className="w-full text-left px-3 py-2 text-sm hover:bg-primary-light/60"
                      >
                        {p.prenom} {p.nom} ({p.numero_dossier})
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </Field>

        {!patient && (
          <div className="grid grid-cols-2 gap-4">
            <Field label="Nom (si connu)">
              <Input
                placeholder="si connu"
                value={nom}
                onChange={(e) => setNom(e.target.value)}
              />
            </Field>
            <Field label="Prénom (si connu)">
              <Input
                placeholder="si connu"
                value={prenom}
                onChange={(e) => setPrenom(e.target.value)}
              />
            </Field>
          </div>
        )}

        <Field label="Notes d'admission">
          <Textarea
            placeholder="Notes d'admission, circonstances..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
          />
        </Field>

        {error && (
          <p className="rounded-lg bg-danger-light px-3 py-2 text-sm text-danger">
            {error}
          </p>
        )}

        <Button type="submit" variant="danger" disabled={isSubmitting} className="self-start">
          {isSubmitting ? "Admission..." : "Admettre aux urgences"}
        </Button>
      </form>
    </Card>
  );
}
