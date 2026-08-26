"use client";

import { useCallback, useEffect, useState } from "react";
import { AlertTriangle, Clock, FlaskConical, Zap, type LucideIcon } from "lucide-react";
import { annuler, fetchWorkList, preleve } from "./laboratoire-api";
import { SaisirResultatModal } from "./SaisirResultatModal";
import { ValiderResultatModal } from "./ValiderResultatModal";
import type { DemandeAnalyse } from "./types";
import { Badge, Button, Card, Pagination, type Tone } from "@/components/ui";
import { useTranslation } from "@/lib/i18n/LanguageContext";

const STATUT_TONE: Record<DemandeAnalyse["statut"], Tone> = {
  demandee: "neutral",
  preleve: "accent",
  valide_technicien: "primary",
  valide: "success",
  annulee: "danger",
};

const STAT_CHIP: Record<Tone, string> = {
  primary: "bg-primary-light text-primary",
  accent: "bg-accent-light text-accent",
  success: "bg-success-light text-success",
  warning: "bg-warning-light text-warning",
  danger: "bg-danger-light text-danger",
  neutral: "bg-foreground/5 text-muted",
};

const STAT_TEXT: Record<Tone, string> = {
  primary: "text-primary",
  accent: "text-accent",
  success: "text-success",
  warning: "text-warning",
  danger: "text-danger",
  neutral: "text-foreground",
};

function StatCard({
  icon: Icon,
  label,
  value,
  tone = "neutral",
}: {
  icon: LucideIcon;
  label: string;
  value: number;
  tone?: Tone;
}) {
  return (
    <Card className="flex items-center gap-3 p-4">
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

export function WorkList() {
  const { t } = useTranslation();
  const [demandes, setDemandes] = useState<DemandeAnalyse[]>([]);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [saisieTarget, setSaisieTarget] = useState<DemandeAnalyse | null>(null);
  const [validationTarget, setValidationTarget] = useState<DemandeAnalyse | null>(null);

  const STATUT_LABELS: Record<DemandeAnalyse["statut"], string> = {
    demandee: t("laboratoire.statutDemandee"),
    preleve: t("laboratoire.statutPreleve"),
    valide_technicien: t("laboratoire.statutValideTechnicien"),
    valide: t("laboratoire.statutValide"),
    annulee: t("laboratoire.statutAnnulee"),
  };

  const load = useCallback(() => {
    fetchWorkList(page).then((res) => {
      setDemandes(res.data);
      setTotalPages(res.meta.last_page);
    });
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

  const enAttenteCount = demandes.filter((d) => d.statut === "demandee" || d.statut === "preleve").length;
  const aValiderCount = demandes.filter((d) => d.statut === "valide_technicien").length;
  const anormauxCount = demandes.filter((d) => d.resultat_anormal || d.resultat_critique).length;
  const urgentesCount = demandes.filter((d) => d.urgente).length;

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard icon={Clock} label={t("dashboard.laboratoire.enAttente")} value={enAttenteCount} tone="warning" />
        <StatCard icon={FlaskConical} label={t("dashboard.laboratoire.aValiderBiologiste")} value={aValiderCount} tone="primary" />
        <StatCard icon={AlertTriangle} label={t("dashboard.laboratoire.resultatsAnormaux")} value={anormauxCount} tone="danger" />
        <StatCard icon={Zap} label={t("laboratoire.statUrgentes")} value={urgentesCount} tone="accent" />
      </div>
      <Card className="p-0 overflow-hidden">
        <table className="table">
          <thead>
            <tr>
              <th>{t("laboratoire.colPatient")}</th>
              <th>{t("laboratoire.colAnalyse")}</th>
              <th>{t("common.status")}</th>
              <th>{t("laboratoire.resultat")}</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {demandes.map((d) => (
              <tr
                key={d.id}
                className={d.resultat_critique ? "bg-danger-light" : d.urgente ? "bg-warning-light" : ""}
              >
                <td>
                  {d.patient.prenom} {d.patient.nom}
                  {d.urgente && (
                    <span className="ml-2">
                      <Badge tone="danger">{t("laboratoire.urgent")}</Badge>
                    </span>
                  )}
                </td>
                <td>{d.analyse_type.nom}</td>
                <td>
                  <Badge tone={STATUT_TONE[d.statut]}>{STATUT_LABELS[d.statut]}</Badge>
                </td>
                <td>
                  {d.resultat_valeur ? (
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
                      {d.resultat_critique && t("laboratoire.critique")}
                    </span>
                  ) : (
                    "-"
                  )}
                </td>
                <td>
                  <div className="flex items-center gap-2">
                    {d.statut === "demandee" && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handlePreleve(d.id)}
                        disabled={busyId === d.id}
                      >
                        {t("laboratoire.preleve")}
                      </Button>
                    )}
                    {(d.statut === "preleve" || d.statut === "valide_technicien") && (
                      <Button variant="ghost" size="sm" onClick={() => setSaisieTarget(d)}>
                        {d.statut === "valide_technicien" ? t("laboratoire.modifier") : t("laboratoire.saisir")}
                      </Button>
                    )}
                    {d.statut === "valide_technicien" && (
                      <Button variant="ghost" size="sm" onClick={() => setValidationTarget(d)}>
                        {t("laboratoire.validerBiologiste")}
                      </Button>
                    )}
                    {d.statut !== "valide" && d.statut !== "annulee" && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleAnnuler(d.id)}
                        disabled={busyId === d.id}
                        className="text-danger hover:bg-danger-light"
                      >
                        {t("common.cancel")}
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {demandes.length === 0 && (
              <tr>
                <td colSpan={5} className="text-muted">
                  {t("laboratoire.noRequests")}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>
      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />

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
