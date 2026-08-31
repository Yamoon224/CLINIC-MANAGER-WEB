"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { IconChevronLeft } from "@tabler/icons-react";
import { PdfButton } from "@/components/ui";
import { useTranslation } from "@/lib/i18n/LanguageContext";
import { fetchDossierMedical } from "./dossier-api";
import { DossierMedical } from "./DossierMedical";
import type { DossierMedical as DossierMedicalData } from "./types";

export function DossierMedicalPage({ id }: { id: number }) {
  const { t } = useTranslation();
  const [dossier, setDossier] = useState<DossierMedicalData | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetchDossierMedical(id)
      .then((res) => setDossier(res.data))
      .catch(() => setError(true));
  }, [id]);

  if (error)
    return <p className="text-danger">{t("dossierMedical.loadError")}</p>;
  if (!dossier) return <p className="text-muted">{t("common.loading")}</p>;

  const { patient } = dossier;

  return (
    <div className="flex flex-col gap-4">
      <Link
        href={`/patients/${patient.id}`}
        className="inline-flex w-fit items-center gap-1 text-sm font-semibold text-heading hover:text-primary"
      >
        <IconChevronLeft size={16} />
        {t("dossierMedical.backToPatient")}
      </Link>

      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="m-0 text-xl font-bold text-heading">
            {t("dossierMedical.title")} — {patient.prenom} {patient.nom}
          </h1>
          <p className="m-0 text-[13px] text-muted">
            {t("patients.numeroDossier")} {patient.numero_dossier}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <PdfButton
            path={`/patients/${patient.id}/dossier.pdf`}
            label={t("dossierMedical.exportPdf")}
          />
          <PdfButton
            path={`/patients/${patient.id}/carte.pdf`}
            label={t("dossierMedical.cartePatient")}
          />
        </div>
      </div>

      <DossierMedical dossier={dossier} />
    </div>
  );
}
