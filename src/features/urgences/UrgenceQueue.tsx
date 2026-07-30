"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { Badge, Button, Card, Modal, PageHeader, Pagination } from "@/components/ui";
import { useTranslation } from "@/lib/i18n/LanguageContext";
import { AdmissionForm } from "./AdmissionForm";
import { fetchFileAttente } from "./urgences-api";
import { type AdmissionUrgence, type NiveauTriage } from "./types";

const TRIAGE_TONE: Record<NiveauTriage, "primary" | "accent" | "success" | "warning" | "danger"> = {
  reanimation: "danger",
  tres_urgent: "danger",
  urgent: "warning",
  semi_urgent: "primary",
  non_urgent: "success",
};

export function UrgenceQueue() {
  const { t } = useTranslation();
  const [admissions, setAdmissions] = useState<AdmissionUrgence[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showForm, setShowForm] = useState(false);

  const reload = useCallback(() => {
    fetchFileAttente(page).then((res) => {
      setAdmissions(res.data);
      setTotalPages(res.meta.last_page);
    });
  }, [page]);

  useEffect(() => {
    reload();
    const interval = setInterval(reload, 5000);
    return () => clearInterval(interval);
  }, [reload]);

  return (
    <div className="flex flex-col gap-3">
      <PageHeader
        title={t("urgences.title")}
        actions={
          <Button onClick={() => setShowForm(true)}>
            + {t("urgences.newAdmission")}
          </Button>
        }
      />

      {admissions.map((a) => (
        <Link key={a.id} href={`/urgences/${a.id}`}>
          <Card className="flex items-center justify-between hover:bg-primary-light/40 transition-colors">
            <div className="flex items-center gap-3">
              {a.niveau_triage ? (
                <Badge tone={TRIAGE_TONE[a.niveau_triage]}>
                  {t(`urgences.niveau.${a.niveau_triage}`)}
                </Badge>
              ) : (
                <Badge tone="neutral">{t("urgences.aTrier")}</Badge>
              )}
              <span className="text-foreground">
                {a.patient.prenom} {a.patient.nom}
              </span>
              <span className="text-sm text-muted">{a.patient.numero_dossier}</span>
            </div>
            <span className="text-sm text-muted">
              {a.admitted_at &&
                new Date(a.admitted_at).toLocaleTimeString("fr-FR", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
            </span>
          </Card>
        </Link>
      ))}

      {admissions.length === 0 && (
        <p className="text-sm text-muted">{t("urgences.empty")}</p>
      )}

      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />

      <Modal
        open={showForm}
        onClose={() => setShowForm(false)}
        title={t("urgences.newAdmission")}
        size="lg"
      >
        <AdmissionForm onCancel={() => setShowForm(false)} />
      </Modal>
    </div>
  );
}
