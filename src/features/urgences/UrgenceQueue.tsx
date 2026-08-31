"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { IconAlertTriangle, IconClock, IconPlus, IconUsers } from "@tabler/icons-react";
import {
  Badge,
  Button,
  DataTable,
  Modal,
  PageHeader,
  StatCard,
  type Column,
  type Tone,
} from "@/components/ui";
import { useTranslation } from "@/lib/i18n/LanguageContext";
import { AdmissionForm } from "./AdmissionForm";
import { fetchFileAttente } from "./urgences-api";
import { type AdmissionUrgence, type NiveauTriage } from "./types";

const TRIAGE_TONE: Record<NiveauTriage, Tone> = {
  reanimation: "danger",
  tres_urgent: "danger",
  urgent: "warning",
  semi_urgent: "primary",
  non_urgent: "success",
};

export function UrgenceQueue() {
  const { t } = useTranslation();
  const router = useRouter();
  const [admissions, setAdmissions] = useState<AdmissionUrgence[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const reload = useCallback(() => {
    fetchFileAttente(page)
      .then((res) => {
        setAdmissions(res.data);
        setTotal(res.meta.total);
      })
      .finally(() => setLoading(false));
  }, [page]);

  useEffect(() => {
    reload();
    const interval = setInterval(reload, 5000);
    return () => clearInterval(interval);
  }, [reload]);

  const columns: Column<AdmissionUrgence>[] = [
    {
      key: "triage",
      header: t("urgences.aTrier"),
      cell: (a) =>
        a.niveau_triage ? (
          <Badge tone={TRIAGE_TONE[a.niveau_triage]} border>
            {t(`urgences.niveau.${a.niveau_triage}`)}
          </Badge>
        ) : (
          <Badge tone="neutral">{t("urgences.aTrier")}</Badge>
        ),
    },
    {
      key: "patient",
      header: t("queue.table.patient"),
      cell: (a) => (
        <span className="font-semibold text-heading">
          {a.patient.prenom} {a.patient.nom}
        </span>
      ),
    },
    {
      key: "dossier",
      header: t("patients.numeroDossier"),
      cell: (a) => a.patient.numero_dossier,
    },
    {
      key: "heure",
      header: t("common.date"),
      cell: (a) => (
        <span className="flex items-center gap-1 text-muted">
          <IconClock size={14} />
          {a.admitted_at
            ? new Date(a.admitted_at).toLocaleTimeString("fr-FR", {
                hour: "2-digit",
                minute: "2-digit",
              })
            : "-"}
        </span>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title={t("urgences.title")}
        total={total}
        actions={
          <Button icon={<IconPlus size={15} />} onClick={() => setShowForm(true)}>
            {t("urgences.newAdmission")}
          </Button>
        }
      />

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard
          label={t("urgences.stats.enFile")}
          value={total}
          tone="primary"
          icon={<IconUsers size={18} />}
        />
        <StatCard
          label={t("urgences.stats.nonTries")}
          value={admissions.filter((a) => !a.niveau_triage).length}
          tone="danger"
          icon={<IconAlertTriangle size={18} />}
        />
      </div>

      <DataTable
        columns={columns}
        rows={admissions}
        getRowKey={(a) => a.id}
        page={page}
        perPage={15}
        total={total}
        onPageChange={setPage}
        loading={loading}
        emptyLabel={t("urgences.empty")}
        onRowClick={(a) => router.push(`/urgences/${a.id}`)}
      />

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
