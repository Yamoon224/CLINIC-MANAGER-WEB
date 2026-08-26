"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Badge, Button, Modal, Pagination } from "@/components/ui";
import { useTranslation } from "@/lib/i18n/LanguageContext";
import { AdmissionAction } from "./AdmissionAction";
import { fetchPatientSejours } from "./hospitalisation-api";
import type { Sejour } from "./types";

export function PatientSejours({ patientId }: { patientId: number }) {
  const { t } = useTranslation();
  const [sejours, setSejours] = useState<Sejour[] | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showAdmission, setShowAdmission] = useState(false);

  useEffect(() => {
    fetchPatientSejours(patientId, page).then((res) => {
      setSejours(res.data);
      setTotalPages(res.meta.last_page);
    });
  }, [patientId, page]);

  if (sejours === null) return null;

  const enCours = sejours.some((s) => s.statut === "en_cours");

  return (
    <div>
      <h2 className="font-semibold mb-2 text-foreground">{t("hospitalisation.sejours.title")}</h2>
      <ul className="flex flex-col gap-2 mb-3 text-sm">
        {sejours.map((s) => (
          <li
            key={s.id}
            className="flex items-center justify-between rounded-xl border border-border bg-surface p-3"
          >
            <Link href={`/sejours/${s.id}`} className="font-medium text-primary hover:underline">
              {t("hospitalisation.sejours.room", { chambre: s.lit.chambre, numero: s.lit.numero })}
            </Link>
            {s.statut === "en_cours" ? (
              <Badge tone="primary">{t("hospitalisation.sejours.ongoing")}</Badge>
            ) : (
              <Badge tone="neutral">
                {t("hospitalisation.sejours.days", { count: s.nombre_jours })}
              </Badge>
            )}
          </li>
        ))}
        {sejours.length === 0 && (
          <li className="text-muted">{t("hospitalisation.sejours.empty")}</li>
        )}
      </ul>
      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
      {!enCours && (
        <>
          <Button onClick={() => setShowAdmission(true)}>
            + {t("hospitalisation.admission.submit")}
          </Button>
          <Modal
            open={showAdmission}
            onClose={() => setShowAdmission(false)}
            title={t("hospitalisation.admission.title")}
            size="md"
          >
            <AdmissionAction
              patientId={patientId}
              onCancel={() => setShowAdmission(false)}
            />
          </Modal>
        </>
      )}
    </div>
  );
}
