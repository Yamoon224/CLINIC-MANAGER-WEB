"use client";

import { useCallback, useEffect, useState } from "react";
import { annuler, fetchWorkList, preleve, saisirResultat, validerBiologiste } from "./laboratoire-api";
import type { DemandeAnalyse } from "./types";

const STATUT_LABELS: Record<DemandeAnalyse["statut"], string> = {
  demandee: "Demandée",
  preleve: "Prélevée",
  valide_technicien: "Résultat saisi",
  valide: "Validée",
  annulee: "Annulée",
};

export function WorkList() {
  const [demandes, setDemandes] = useState<DemandeAnalyse[]>([]);
  const [valeurs, setValeurs] = useState<Record<number, string>>({});
  const [busyId, setBusyId] = useState<number | null>(null);

  const load = useCallback(() => {
    fetchWorkList().then((res) => setDemandes(res.data));
  }, []);

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

  async function handleSaisirResultat(id: number) {
    const valeur = valeurs[id];
    if (!valeur) return;
    setBusyId(id);
    try {
      await saisirResultat(id, valeur);
      load();
    } finally {
      setBusyId(null);
    }
  }

  async function handleValider(id: number) {
    setBusyId(id);
    try {
      await validerBiologiste(id);
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

  return (
    <table className="w-full text-sm border-collapse">
      <thead>
        <tr className="text-left border-b">
          <th className="py-2 pr-4">Patient</th>
          <th className="py-2 pr-4">Analyse</th>
          <th className="py-2 pr-4">Statut</th>
          <th className="py-2 pr-4">Résultat</th>
          <th className="py-2 pr-4"></th>
        </tr>
      </thead>
      <tbody>
        {demandes.map((d) => (
          <tr
            key={d.id}
            className={`border-b ${d.urgente ? "bg-red-50" : ""} ${d.resultat_critique ? "bg-red-100" : ""}`}
          >
            <td className="py-2 pr-4">
              {d.patient.prenom} {d.patient.nom}
              {d.urgente && <span className="text-red-600 font-semibold"> · URGENT</span>}
            </td>
            <td className="py-2 pr-4">{d.analyse_type.nom}</td>
            <td className="py-2 pr-4">{STATUT_LABELS[d.statut]}</td>
            <td className="py-2 pr-4">
              {d.resultat_valeur ? (
                <span className={d.resultat_critique ? "text-red-700 font-bold" : d.resultat_anormal ? "text-orange-600 font-medium" : ""}>
                  {d.resultat_valeur} {d.analyse_type.unite}
                  {d.resultat_critique && " ⚠ critique"}
                </span>
              ) : (
                "-"
              )}
            </td>
            <td className="py-2 pr-4">
              {d.statut === "demandee" && (
                <button
                  onClick={() => handlePreleve(d.id)}
                  disabled={busyId === d.id}
                  className="underline disabled:opacity-50 mr-3"
                >
                  Prélever
                </button>
              )}
              {d.statut === "preleve" && (
                <span className="flex items-center gap-2">
                  <input
                    placeholder="Valeur"
                    value={valeurs[d.id] ?? ""}
                    onChange={(e) => setValeurs((v) => ({ ...v, [d.id]: e.target.value }))}
                    className="border rounded px-2 py-1 w-24"
                  />
                  <button
                    onClick={() => handleSaisirResultat(d.id)}
                    disabled={busyId === d.id}
                    className="underline disabled:opacity-50"
                  >
                    Saisir
                  </button>
                </span>
              )}
              {d.statut === "valide_technicien" && (
                <button
                  onClick={() => handleValider(d.id)}
                  disabled={busyId === d.id}
                  className="underline disabled:opacity-50 mr-3"
                >
                  Valider (biologiste)
                </button>
              )}
              {d.statut !== "valide" && d.statut !== "annulee" && (
                <button
                  onClick={() => handleAnnuler(d.id)}
                  disabled={busyId === d.id}
                  className="underline text-red-600 disabled:opacity-50"
                >
                  Annuler
                </button>
              )}
            </td>
          </tr>
        ))}
        {demandes.length === 0 && (
          <tr>
            <td colSpan={5} className="py-2 text-gray-500">
              Aucune demande en cours.
            </td>
          </tr>
        )}
      </tbody>
    </table>
  );
}
