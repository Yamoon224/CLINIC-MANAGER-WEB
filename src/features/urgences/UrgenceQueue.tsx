"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { AlertTriangle, Clock, Users, type LucideIcon } from "lucide-react";
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

type StatTone = "primary" | "danger";

const STAT_CHIP: Record<StatTone, string> = {
  primary: "bg-primary-light text-primary",
  danger: "bg-danger-light text-danger",
};

const STAT_TEXT: Record<StatTone, string> = {
  primary: "text-primary",
  danger: "text-danger",
};

function StatCard({
  label,
  value,
  tone,
  icon: Icon,
}: {
  label: string;
  value: number;
  tone: StatTone;
  icon: LucideIcon;
}) {
  return (
    <Card className="flex items-start gap-3 p-4">
      <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${STAT_CHIP[tone]}`}>
        <Icon size={18} />
      </span>
      <div className="min-w-0">
        <div className="text-xs font-medium text-muted">{label}</div>
        <div className={`mt-1 text-2xl font-semibold ${STAT_TEXT[tone]}`}>{value}</div>
      </div>
    </Card>
  );
}

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

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard label={t("urgences.stats.enFile")} value={admissions.length} tone="primary" icon={Users} />
        <StatCard
          label={t("urgences.stats.nonTries")}
          value={admissions.filter((a) => !a.niveau_triage).length}
          tone="danger"
          icon={AlertTriangle}
        />
      </div>

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
            <span className="flex items-center gap-1 text-sm text-muted">
              <Clock size={14} />
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
