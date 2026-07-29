"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { fetchPatientHistory } from "./consultations-api";
import type { Consultation } from "./types";
import { Card, Pagination } from "@/components/ui";
import { useTranslation } from "@/lib/i18n/LanguageContext";

export function PatientHistory({ patientId }: { patientId: number }) {
  const { t } = useTranslation();
  const [consultations, setConsultations] = useState<Consultation[] | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchPatientHistory(patientId, page).then((res) => {
      setConsultations(res.data);
      setTotalPages(res.meta.last_page);
    });
  }, [patientId, page]);

  if (consultations === null) {
    return <p className="text-sm text-muted">{t("consultations.loadingHistory")}</p>;
  }

  if (consultations.length === 0) {
    return <p className="text-sm text-muted">{t("consultations.noHistory")}</p>;
  }

  return (
    <div className="flex flex-col gap-2">
      <ul className="flex flex-col gap-2">
        {consultations.map((c) => (
          <li key={c.id}>
            <Card className="p-3 text-sm">
              <div className="flex items-center justify-between">
                <Link href={`/consultations/${c.id}`} className="font-semibold text-primary hover:underline">
                  {c.motif}
                </Link>
                <span className="text-muted">
                  {c.started_at &&
                    new Date(c.started_at).toLocaleString("fr-FR", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                </span>
              </div>
              <p className="text-muted">
                {t("consultations.doctorPrefix", { name: c.praticien.name })}
                {c.diagnostic && <> - {c.diagnostic}</>}
              </p>
            </Card>
          </li>
        ))}
      </ul>
      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
    </div>
  );
}
