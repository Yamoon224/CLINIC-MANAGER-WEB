"use client";

import { useCallback, useEffect, useState } from "react";
import { DemandeAnalysesAction } from "./DemandeAnalysesAction";
import { fetchPatientDemandes } from "./laboratoire-api";
import type { DemandeAnalyse } from "./types";
import { Badge } from "@/components/ui";

const STATUT_LABELS: Record<DemandeAnalyse["statut"], string> = {
  demandee: "Demandée",
  preleve: "Prélevée",
  valide_technicien: "Résultat en attente de validation",
  valide: "Validée",
  annulee: "Annulée",
};

export function PatientAnalyses({ patientId }: { patientId: number }) {
  const [demandes, setDemandes] = useState<DemandeAnalyse[] | null>(null);

  const load = useCallback(() => {
    fetchPatientDemandes(patientId).then((res) => setDemandes(res.data));
  }, [patientId]);

  useEffect(() => {
    load();
  }, [load]);

  if (demandes === null) return null;

  return (
    <div>
      <h2 className="font-semibold text-foreground mb-2">Analyses de laboratoire</h2>
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
                Résultat : {d.resultat_valeur} {d.analyse_type.unite}
                {d.resultat_critique && " ⚠ valeur critique"}
              </p>
            )}
          </li>
        ))}
        {demandes.length === 0 && (
          <li className="text-muted">Aucune analyse demandée.</li>
        )}
      </ul>
      <DemandeAnalysesAction patientId={patientId} onCreated={load} />
    </div>
  );
}
