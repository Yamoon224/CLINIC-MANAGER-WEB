"use client";

import { useCallback, useEffect, useState } from "react";
import { DemandeAnalysesAction } from "./DemandeAnalysesAction";
import { fetchPatientDemandes } from "./laboratoire-api";
import type { DemandeAnalyse } from "./types";

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
      <h2 className="font-semibold mb-2">Analyses de laboratoire</h2>
      <ul className="flex flex-col gap-1 mb-3 text-sm">
        {demandes.map((d) => (
          <li key={d.id} className="border rounded p-2">
            <div className="flex justify-between">
              <span className="font-medium">{d.analyse_type.nom}</span>
              <span className="text-gray-500">{STATUT_LABELS[d.statut]}</span>
            </div>
            {d.resultat_valeur && d.statut === "valide" && (
              <p className={d.resultat_critique ? "text-red-700 font-bold" : d.resultat_anormal ? "text-orange-600" : ""}>
                Résultat : {d.resultat_valeur} {d.analyse_type.unite}
                {d.resultat_critique && " ⚠ valeur critique"}
              </p>
            )}
          </li>
        ))}
        {demandes.length === 0 && (
          <li className="text-gray-500">Aucune analyse demandée.</li>
        )}
      </ul>
      <DemandeAnalysesAction patientId={patientId} onCreated={load} />
    </div>
  );
}
