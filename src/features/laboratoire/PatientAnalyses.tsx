"use client";

import { useCallback, useEffect, useState } from "react";
import { DemandeAnalysesAction } from "./DemandeAnalysesAction";
import { fetchPatientDemandes } from "./laboratoire-api";
import type { DemandeAnalyse } from "./types";
import { Badge, Pagination } from "@/components/ui";
import { useTranslation } from "@/lib/i18n/LanguageContext";

export function PatientAnalyses({ patientId }: { patientId: number }) {
  const { t } = useTranslation();
  const [demandes, setDemandes] = useState<DemandeAnalyse[] | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const STATUT_LABELS: Record<DemandeAnalyse["statut"], string> = {
    demandee: t("laboratoire.statutDemandee"),
    preleve: t("laboratoire.statutPreleve"),
    valide_technicien: t("laboratoire.statutValideTechnicienPatient"),
    valide: t("laboratoire.statutValide"),
    annulee: t("laboratoire.statutAnnulee"),
  };

  const load = useCallback(() => {
    fetchPatientDemandes(patientId, page).then((res) => {
      setDemandes(res.data);
      setTotalPages(res.meta.last_page);
    });
  }, [patientId, page]);

  useEffect(() => {
    load();
  }, [load]);

  if (demandes === null) return null;

  return (
    <div>
      <h2 className="font-semibold text-foreground mb-2">{t("laboratoire.title")}</h2>
      <ul className="flex flex-col gap-2 mb-3 text-sm">
        {demandes.map((d) => (
          <li key={d.id} className="rounded-lg border border-border p-2">
            <div className="flex items-center justify-between">
              <span className="font-medium text-foreground">{d.analyse_type.nom}</span>
              <Badge tone="neutral">{STATUT_LABELS[d.statut]}</Badge>
            </div>
            {d.resultat_valeur && d.statut === "valide" && (
              <p
                className={`mt-1 ${
                  d.resultat_critique
                    ? "font-bold text-danger"
                    : d.resultat_anormal
                      ? "text-warning"
                      : "text-muted"
                }`}
              >
                {t("laboratoire.resultatLine", { valeur: d.resultat_valeur, unite: d.analyse_type.unite ?? "" })}
                {d.resultat_critique && t("laboratoire.criticalValue")}
              </p>
            )}
          </li>
        ))}
        {demandes.length === 0 && (
          <li className="text-muted">{t("laboratoire.noRequestsPatient")}</li>
        )}
      </ul>
      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
      <DemandeAnalysesAction patientId={patientId} onCreated={load} />
    </div>
  );
}
