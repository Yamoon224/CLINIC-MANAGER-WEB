"use client";

import { useCallback, useEffect, useState } from "react";
import {
  IconAlertTriangle,
  IconBolt,
  IconClock,
  IconFlask,
} from "@tabler/icons-react";
import { annuler, fetchWorkList, preleve } from "./laboratoire-api";
import { SaisirResultatModal } from "./SaisirResultatModal";
import { ValiderResultatModal } from "./ValiderResultatModal";
import type { DemandeAnalyse } from "./types";
import {
  Badge,
  Button,
  DataTable,
  StatCard,
  type Column,
  type Tone,
} from "@/components/ui";
import { useTranslation } from "@/lib/i18n/LanguageContext";

const STATUT_TONE: Record<DemandeAnalyse["statut"], Tone> = {
  demandee: "neutral",
  preleve: "accent",
  valide_technicien: "primary",
  valide: "success",
  annulee: "danger",
};

export function WorkList() {
  const { t } = useTranslation();
  const [demandes, setDemandes] = useState<DemandeAnalyse[]>([]);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saisieTarget, setSaisieTarget] = useState<DemandeAnalyse | null>(null);
  const [validationTarget, setValidationTarget] =
    useState<DemandeAnalyse | null>(null);

  const STATUT_LABELS: Record<DemandeAnalyse["statut"], string> = {
    demandee: t("laboratoire.statutDemandee"),
    preleve: t("laboratoire.statutPreleve"),
    valide_technicien: t("laboratoire.statutValideTechnicien"),
    valide: t("laboratoire.statutValide"),
    annulee: t("laboratoire.statutAnnulee"),
  };

  const load = useCallback(() => {
    fetchWorkList(page)
      .then((res) => {
        setDemandes(res.data);
        setTotal(res.meta.total);
      })
      .finally(() => setLoading(false));
  }, [page]);

  useEffect(() => {
    load();
    const interval = setInterval(load, 10000);
    return () => clearInterval(interval);
  }, [load]);

  async function handlePreleve(id: number) {
    setBusyId(id);
    try {
      await preleve(id);
      load();
    } finally {
      setBusyId(null);
    }
  }

  async function handleAnnuler(id: number) {
    setBusyId(id);
    try {
      await annuler(id);
      load();
    } finally {
      setBusyId(null);
    }
  }

  const enAttenteCount = demandes.filter(
    (d) => d.statut === "demandee" || d.statut === "preleve",
  ).length;
  const aValiderCount = demandes.filter(
    (d) => d.statut === "valide_technicien",
  ).length;
  const anormauxCount = demandes.filter(
    (d) => d.resultat_anormal || d.resultat_critique,
  ).length;
  const urgentesCount = demandes.filter((d) => d.urgente).length;

  const columns: Column<DemandeAnalyse>[] = [
    {
      key: "patient",
      header: t("laboratoire.colPatient"),
      cell: (d) => (
        <span className="flex items-center gap-2">
          <span className="font-semibold text-heading">
            {d.patient.prenom} {d.patient.nom}
          </span>
          {d.urgente && (
            <Badge tone="danger" border>
              {t("laboratoire.urgent")}
            </Badge>
          )}
        </span>
      ),
    },
    {
      key: "analyse",
      header: t("laboratoire.colAnalyse"),
      cell: (d) => d.analyse_type.nom,
    },
    {
      key: "statut",
      header: t("common.status"),
      cell: (d) => (
        <Badge tone={STATUT_TONE[d.statut]} border>
          {STATUT_LABELS[d.statut]}
        </Badge>
      ),
    },
    {
      key: "resultat",
      header: t("laboratoire.resultat"),
      cell: (d) =>
        d.resultat_valeur ? (
          <span
            className={
              d.resultat_critique
                ? "font-bold text-danger"
                : d.resultat_anormal
                  ? "font-medium text-warning"
                  : ""
            }
          >
            {d.resultat_valeur} {d.analyse_type.unite}
            {d.resultat_critique && ` ${t("laboratoire.critique")}`}
          </span>
        ) : (
          "-"
        ),
    },
    {
      key: "actions",
      header: "",
      className: "text-right",
      headClassName: "text-right",
      cell: (d) => (
        <div className="flex justify-end gap-1.5">
          {d.statut === "demandee" && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePreleve(d.id)}
              disabled={busyId === d.id}
            >
              {t("laboratoire.preleve")}
            </Button>
          )}
          {(d.statut === "preleve" || d.statut === "valide_technicien") && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSaisieTarget(d)}
            >
              {d.statut === "valide_technicien"
                ? t("laboratoire.modifier")
                : t("laboratoire.saisir")}
            </Button>
          )}
          {d.statut === "valide_technicien" && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setValidationTarget(d)}
            >
              {t("laboratoire.validerBiologiste")}
            </Button>
          )}
          {d.statut !== "valide" && d.statut !== "annulee" && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleAnnuler(d.id)}
              disabled={busyId === d.id}
              className="border-danger/40 text-danger hover:bg-danger-light"
            >
              {t("common.cancel")}
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard
          icon={<IconClock size={18} />}
          label={t("dashboard.laboratoire.enAttente")}
          value={enAttenteCount}
          tone="warning"
        />
        <StatCard
          icon={<IconFlask size={18} />}
          label={t("dashboard.laboratoire.aValiderBiologiste")}
          value={aValiderCount}
          tone="primary"
        />
        <StatCard
          icon={<IconAlertTriangle size={18} />}
          label={t("dashboard.laboratoire.resultatsAnormaux")}
          value={anormauxCount}
          tone="danger"
        />
        <StatCard
          icon={<IconBolt size={18} />}
          label={t("laboratoire.statUrgentes")}
          value={urgentesCount}
          tone="accent"
        />
      </div>

      <DataTable
        columns={columns}
        rows={demandes}
        getRowKey={(d) => d.id}
        page={page}
        perPage={15}
        total={total}
        onPageChange={setPage}
        loading={loading}
        emptyLabel={t("laboratoire.noRequests")}
      />

      {saisieTarget && (
        <SaisirResultatModal
          demande={saisieTarget}
          onClose={() => setSaisieTarget(null)}
          onSaved={() => {
            setSaisieTarget(null);
            load();
          }}
        />
      )}

      {validationTarget && (
        <ValiderResultatModal
          demande={validationTarget}
          onClose={() => setValidationTarget(null)}
          onValidated={() => {
            setValidationTarget(null);
            load();
          }}
        />
      )}
    </div>
  );
}
