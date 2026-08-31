"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { Patient } from "@/features/patients/types";
import {
  Button,
  DateInput,
  Field,
  PatientSelect,
  Select,
  Textarea,
} from "@/components/ui";
import { useTranslation } from "@/lib/i18n/LanguageContext";
import {
  createRendezVous,
  fetchCreneauxDisponibles,
  fetchPraticiens,
} from "./rendezvous-api";
import {
  RENDEZ_VOUS_TYPES,
  type Praticien,
  type RendezVous,
  type RendezVousType,
} from "./types";

export function RendezVousForm({
  initialDate,
  onCancel,
  onCreated,
}: {
  initialDate?: string;
  onCancel?: () => void;
  onCreated?: (rendezVous: RendezVous) => void;
}) {
  const router = useRouter();
  const { t } = useTranslation();

  const [patient, setPatient] = useState<Patient | null>(null);

  const [praticiens, setPraticiens] = useState<Praticien[]>([]);
  const [praticienId, setPraticienId] = useState<number | "">("");
  const [type, setType] = useState<RendezVousType>("consultation");
  const [date, setDate] = useState(initialDate ?? new Date().toISOString().slice(0, 10));

  const [creneaux, setCreneaux] = useState<string[]>([]);
  const [startsAt, setStartsAt] = useState("");
  const [motif, setMotif] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchPraticiens().then((res) => setPraticiens(res.data));
  }, []);

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
      const { data } = await createRendezVous({
        patient_id: patient.id,
        praticien_id: praticienId,
        type,
        starts_at: startsAt,
        motif: motif || undefined,
      });
      if (onCreated) onCreated(data);
      else router.push("/rendez-vous");
    } catch {
      setError(t("rendezvous.form.submitError"));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Field label={t("rendezvous.form.patient")} required>
          <PatientSelect
            value={patient}
            onChange={setPatient}
            placeholder={t("rendezvous.form.searchPatientPlaceholder")}
          />
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

          <Field label={t("rendezvous.form.date")} full>
            <DateInput
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
                    className={`rounded-[5px] border px-3 py-1.5 text-sm transition-colors ${
                      startsAt === c
                        ? "border-primary bg-primary text-white"
                        : "border-border bg-surface hover:bg-light"
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
            {isSubmitting ? t("rendezvous.form.submitting") : t("rendezvous.form.submit")}
          </Button>
        </div>
    </form>
  );
}
