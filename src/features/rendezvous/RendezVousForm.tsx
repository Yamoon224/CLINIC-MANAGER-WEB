"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { searchPatients } from "@/features/patients/patients-api";
import type { Patient } from "@/features/patients/types";
import { Button, Card, Field, Input, Select, Textarea } from "@/components/ui";
import {
  createRendezVous,
  fetchCreneauxDisponibles,
  fetchPraticiens,
} from "./rendezvous-api";
import {
  RENDEZ_VOUS_TYPE_LABELS,
  RENDEZ_VOUS_TYPES,
  type Praticien,
  type RendezVousType,
} from "./types";

export function RendezVousForm() {
  const router = useRouter();

  const [patientQuery, setPatientQuery] = useState("");
  const [patientResults, setPatientResults] = useState<Patient[]>([]);
  const [patient, setPatient] = useState<Patient | null>(null);

  const [praticiens, setPraticiens] = useState<Praticien[]>([]);
  const [praticienId, setPraticienId] = useState<number | "">("");
  const [type, setType] = useState<RendezVousType>("consultation");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));

  const [creneaux, setCreneaux] = useState<string[]>([]);
  const [startsAt, setStartsAt] = useState("");
  const [motif, setMotif] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchPraticiens().then((res) => setPraticiens(res.data));
  }, []);

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

  useEffect(() => {
    (async () => {
      setStartsAt("");
      if (!praticienId || !date) {
        setCreneaux([]);
        return;
      }
      const res = await fetchCreneauxDisponibles(praticienId, type, date);
      setCreneaux(res.data);
    })();
  }, [praticienId, type, date]);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    if (!patient || !praticienId || !startsAt) {
      setError("Patient, praticien et créneau sont requis.");
      return;
    }
    setIsSubmitting(true);
    try {
      await createRendezVous({
        patient_id: patient.id,
        praticien_id: praticienId,
        type,
        starts_at: startsAt,
        motif: motif || undefined,
      });
      router.push("/rendez-vous");
    } catch {
      setError("Impossible de créer le rendez-vous (créneau indisponible ?).");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Card className="max-w-xl">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Field label="Patient">
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

        <div className="grid grid-cols-2 gap-4">
          <Field label="Praticien">
            <Select
              value={praticienId}
              onChange={(e) =>
                setPraticienId(e.target.value ? Number(e.target.value) : "")
              }
            >
              <option value="">-</option>
              {praticiens.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </Select>
          </Field>

          <Field label="Type">
            <Select
              value={type}
              onChange={(e) => setType(e.target.value as RendezVousType)}
            >
              {RENDEZ_VOUS_TYPES.map((t) => (
                <option key={t} value={t}>
                  {RENDEZ_VOUS_TYPE_LABELS[t]}
                </option>
              ))}
            </Select>
          </Field>

          <Field label="Date">
            <Input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </Field>
        </div>

        <Field label="Créneau disponible">
          {praticienId ? (
            creneaux.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {creneaux.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setStartsAt(c)}
                    className={`rounded-lg border px-3 py-1.5 text-sm transition-colors ${
                      startsAt === c
                        ? "border-primary bg-primary text-white"
                        : "border-border bg-surface hover:bg-primary-light/60"
                    }`}
                  >
                    {new Date(c).toLocaleTimeString("fr-FR", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted">
                Aucun créneau disponible ce jour-là.
              </p>
            )
          ) : (
            <p className="text-sm text-muted">
              Choisissez un praticien pour voir les créneaux.
            </p>
          )}
        </Field>

        <Field label="Motif">
          <Textarea
            placeholder="Motif du rendez-vous"
            value={motif}
            onChange={(e) => setMotif(e.target.value)}
            rows={2}
          />
        </Field>

        {error && (
          <p className="rounded-lg bg-danger-light px-3 py-2 text-sm text-danger">
            {error}
          </p>
        )}

        <Button type="submit" disabled={isSubmitting} className="self-start">
          {isSubmitting ? "Enregistrement..." : "Prendre le rendez-vous"}
        </Button>
      </form>
    </Card>
  );
}
