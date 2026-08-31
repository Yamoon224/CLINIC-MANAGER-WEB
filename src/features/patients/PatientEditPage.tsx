"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { IconChevronLeft } from "@tabler/icons-react";
import { useTranslation } from "@/lib/i18n/LanguageContext";
import { getPatient } from "./patients-api";
import { PatientForm } from "./PatientForm";
import type { Patient } from "./types";

export function PatientEditPage({ id }: { id: number }) {
  const { t } = useTranslation();
  const router = useRouter();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    getPatient(id)
      .then((res) => setPatient(res.data))
      .catch(() => setError(true));
  }, [id]);

  if (error)
    return <p className="text-danger">{t("patients.detail.notFound")}</p>;
  if (!patient) return <p className="text-muted">{t("common.loading")}</p>;

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-4">
      <Link
        href={`/patients/${id}`}
        className="inline-flex w-fit items-center gap-1 text-sm font-semibold text-heading hover:text-primary"
      >
        <IconChevronLeft size={16} />
        {patient.prenom} {patient.nom}
      </Link>
      <h1 className="m-0 text-lg font-bold text-heading">
        {t("patients.list.edit")}
      </h1>
      <PatientForm
        patient={patient}
        onCancel={() => router.push(`/patients/${id}`)}
        onSaved={() => router.push(`/patients/${id}`)}
      />
    </div>
  );
}
