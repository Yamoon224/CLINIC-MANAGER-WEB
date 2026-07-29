"use client";

import { useEffect, useState } from "react";
import { useTranslation } from "@/lib/i18n/LanguageContext";
import { getPatient } from "./patients-api";
import { PatientDetail } from "./PatientDetail";
import type { Patient } from "./types";

export function PatientDetailPage({ id }: { id: number }) {
  const { t } = useTranslation();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    getPatient(id)
      .then((res) => setPatient(res.data))
      .catch(() => setError(true));
  }, [id]);

  if (error) return <p className="text-danger">{t("patients.detail.notFound")}</p>;
  if (!patient) return <p className="text-muted">{t("common.loading")}</p>;

  return <PatientDetail patient={patient} />;
}
