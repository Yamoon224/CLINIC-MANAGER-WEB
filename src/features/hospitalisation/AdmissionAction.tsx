"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { searchPatients } from "@/features/patients/patients-api";
import type { Patient } from "@/features/patients/types";
import { admettre, fetchLits } from "./hospitalisation-api";
import type { Lit } from "./types";
import { Button, Field, Input, Select } from "@/components/ui";
import { useTranslation } from "@/lib/i18n/LanguageContext";

export function AdmissionAction({
  patientId,
  litId: presetLitId,
  onCancel,
  onAdmitted,
}: {
  patientId?: number;
  litId?: number;
  onCancel?: () => void;
  onAdmitted?: (sejourId: number) => void;
}) {
  const { t } = useTranslation();
  const router = useRouter();
  const [lits, setLits] = useState<Lit[]>([]);
  const [litId, setLitId] = useState<number | "">(presetLitId ?? "");
  const [motif, setMotif] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [patientQuery, setPatientQuery] = useState("");
  const [patientResults, setPatientResults] = useState<Patient[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const effectivePatientId = patientId ?? selectedPatient?.id;

  useEffect(() => {
    if (presetLitId) return;
    fetchLits().then((res) => setLits(res.data.filter((l) => l.statut === "libre")));
  }, [presetLitId]);

  useEffect(() => {
    if (patientId) return;
    const handle = setTimeout(() => {
      if (!patientQuery) {
        setPatientResults([]);
        return;
      }
      searchPatients(patientQuery).then((res) => setPatientResults(res.data));
    }, 250);
    return () => clearTimeout(handle);
  }, [patientQuery, patientId]);

  async function handleSubmit() {
    if (!effectivePatientId || !litId || !motif.trim()) {
      setError(t("hospitalisation.admission.errorRequired"));
      return;
    }
    setIsSubmitting(true);
    setError(null);
    try {
      const { data } = await admettre(effectivePatientId, { lit_id: litId, motif });
      if (onAdmitted) onAdmitted(data.id);
      else router.push(`/sejours/${data.id}`);
    } catch {
      setError(t("hospitalisation.admission.errorSubmit"));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex flex-col gap-3">
      {!patientId && (
        <Field label={t("hospitalisation.admission.patient")}>
          {selectedPatient ? (
            <div className="flex items-center justify-between rounded-lg border border-border bg-surface px-3 py-2 text-sm">
              <span>
                {selectedPatient.prenom} {selectedPatient.nom} ({selectedPatient.numero_dossier})
              </span>
              <button
                type="button"
                onClick={() => setSelectedPatient(null)}
                className="text-sm text-primary hover:underline"
              >
                {t("hospitalisation.admission.changePatient")}
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-1.5">
              <Input
                placeholder={t("hospitalisation.admission.searchPatientPlaceholder")}
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
                          setSelectedPatient(p);
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
      )}
      {!presetLitId && (
        <Field label={t("hospitalisation.admission.lit")}>
          <Select
            value={litId}
            onChange={(e) => setLitId(e.target.value ? Number(e.target.value) : "")}
          >
            <option value="">{t("hospitalisation.admission.litPlaceholder")}</option>
            {lits.map((l) => (
              <option key={l.id} value={l.id}>
                {t("hospitalisation.admission.room", { chambre: l.chambre, numero: l.numero })}
              </option>
            ))}
          </Select>
        </Field>
      )}
      <Field label={t("hospitalisation.admission.motif")}>
        <Input
          placeholder={t("hospitalisation.admission.motifPlaceholder")}
          value={motif}
          onChange={(e) => setMotif(e.target.value)}
        />
      </Field>
      {error && (
        <p className="rounded-[5px] bg-danger-light px-3 py-2 text-sm text-danger">{error}</p>
      )}
      <div className="flex gap-2">
        <Button
          onClick={handleSubmit}
          disabled={isSubmitting || (!presetLitId && lits.length === 0)}
        >
          {t("hospitalisation.admission.submit")}
        </Button>
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            {t("common.cancel")}
          </Button>
        )}
      </div>
      {!presetLitId && lits.length === 0 && (
        <p className="text-sm text-muted">{t("hospitalisation.admission.noLitsAvailable")}</p>
      )}
    </div>
  );
}
