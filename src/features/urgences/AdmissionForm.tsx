"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { IconUser } from "@tabler/icons-react";
import { searchPatients } from "@/features/patients/patients-api";
import type { Patient } from "@/features/patients/types";
import { Button, Field, Input, Textarea } from "@/components/ui";
import { useTranslation } from "@/lib/i18n/LanguageContext";
import { admettre } from "./urgences-api";

export function AdmissionForm({ onCancel }: { onCancel?: () => void }) {
  const router = useRouter();
  const { t } = useTranslation();

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
      setError(t("urgences.form.error"));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <p className="text-sm text-muted">{t("urgences.form.unknownPatientHint")}</p>

        <Field label={t("urgences.form.patientConnu")}>
          {patient ? (
            <div className="flex items-center justify-between rounded-lg border border-border bg-surface px-3 py-2 text-sm">
              <span className="flex items-center gap-2">
                <IconUser size={16} className="text-primary" />
                {patient.prenom} {patient.nom} ({patient.numero_dossier})
              </span>
              <button
                type="button"
                onClick={() => setPatient(null)}
                className="text-sm text-primary hover:underline"
              >
                {t("urgences.form.changePatient")}
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-1.5">
              <Input
                placeholder={t("urgences.form.searchPatientPlaceholder")}
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
            <Field label={t("urgences.form.nomSiConnu")}>
              <Input
                placeholder={t("urgences.form.siConnuPlaceholder")}
                value={nom}
                onChange={(e) => setNom(e.target.value)}
              />
            </Field>
            <Field label={t("urgences.form.prenomSiConnu")}>
              <Input
                placeholder={t("urgences.form.siConnuPlaceholder")}
                value={prenom}
                onChange={(e) => setPrenom(e.target.value)}
              />
            </Field>
          </div>
        )}

        <Field label={t("urgences.form.notesAdmission")}>
          <Textarea
            placeholder={t("urgences.form.notesAdmissionPlaceholder")}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
          />
        </Field>

        {error && (
          <p className="rounded-[5px] bg-danger-light px-3 py-2 text-sm text-danger">
            {error}
          </p>
        )}

        <div className="flex gap-2">
          <Button type="submit" variant="danger" disabled={isSubmitting}>
            {isSubmitting ? t("urgences.form.submitting") : t("urgences.form.submit")}
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
