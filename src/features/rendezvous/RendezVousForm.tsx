"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { searchPatients } from "@/features/patients/patients-api";
import type { Patient } from "@/features/patients/types";
import { Button, Field, Input, Select, Textarea } from "@/components/ui";
import { useTranslation } from "@/lib/i18n/LanguageContext";
import {
  createRendezVous,
  fetchCreneauxDisponibles,
  fetchPraticiens,
} from "./rendezvous-api";
import {
  RENDEZ_VOUS_TYPES,
  type Praticien,
  type RendezVousType,
} from "./types";

export function RendezVousForm({ onCancel }: { onCancel?: () => void }) {
  const router = useRouter();
  const { t } = useTranslation();

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
      setError(t("rendezvous.form.requiredError"));
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
      setError(t("rendezvous.form.submitError"));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Field label={t("rendezvous.form.patient")}>
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
                {t("rendezvous.form.changePatient")}
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-1.5">
              <Input
                placeholder={t("rendezvous.form.searchPatientPlaceholder")}
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
          <Field label={t("rendezvous.form.praticien")}>
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

          <Field label={t("rendezvous.form.type")}>
            <Select
              value={type}
              onChange={(e) => setType(e.target.value as RendezVousType)}
            >
              {RENDEZ_VOUS_TYPES.map((rt) => (
                <option key={rt} value={rt}>
                  {t(`rendezvous.type.${rt}`)}
                </option>
              ))}
            </Select>
          </Field>

          <Field label={t("rendezvous.form.date")}>
            <Input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </Field>
        </div>

        <Field label={t("rendezvous.form.creneauDisponible")}>
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
              <p className="text-sm text-muted">{t("rendezvous.form.noCreneaux")}</p>
            )
          ) : (
            <p className="text-sm text-muted">{t("rendezvous.form.choosePraticien")}</p>
          )}
        </Field>

        <Field label={t("rendezvous.form.motif")}>
          <Textarea
            placeholder={t("rendezvous.form.motifPlaceholder")}
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

        <div className="flex gap-2">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? t("rendezvous.form.submitting") : t("rendezvous.form.submit")}
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
