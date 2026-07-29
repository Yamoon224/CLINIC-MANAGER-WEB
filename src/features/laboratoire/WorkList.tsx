"use client";

import { useCallback, useEffect, useState } from "react";
import { annuler, fetchWorkList, preleve, saisirResultat, validerBiologiste } from "./laboratoire-api";
import type { DemandeAnalyse } from "./types";
import { Badge, Button, Card, Input } from "@/components/ui";

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
    <Card className="p-0 overflow-hidden">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="text-left border-b border-border">
            <th className="py-2 px-4">Patient</th>
            <th className="py-2 px-4">Analyse</th>
            <th className="py-2 px-4">Statut</th>
            <th className="py-2 px-4">Résultat</th>
            <th className="py-2 px-4"></th>
          </tr>
        </thead>
        <tbody>
          {demandes.map((d) => (
            <tr
              key={d.id}
              className={`border-b border-border last:border-0 ${d.resultat_critique ? "bg-danger-light" : d.urgente ? "bg-warning-light" : ""}`}
            >
              <td className="py-2 px-4">
                {d.patient.prenom} {d.patient.nom}
                {d.urgente && (
                  <span className="ml-2">
                    <Badge tone="danger">URGENT</Badge>
                  </span>
                )}
              </td>
              <td className="py-2 px-4">{d.analyse_type.nom}</td>
              <td className="py-2 px-4">
                <Badge tone="neutral">{STATUT_LABELS[d.statut]}</Badge>
              </td>
              <td className="py-2 px-4">
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
                    {d.resultat_critique && " ⚠ critique"}
                  </span>
                ) : (
                  "-"
                )}
              </td>
              <td className="py-2 px-4">
                <div className="flex items-center gap-2">
                  {d.statut === "demandee" && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handlePreleve(d.id)}
                      disabled={busyId === d.id}
                    >
                      Prélever
                    </Button>
                  )}
                  {d.statut === "preleve" && (
                    <span className="flex items-center gap-2">
                      <Input
                        placeholder="Valeur"
                        value={valeurs[d.id] ?? ""}
                        onChange={(e) => setValeurs((v) => ({ ...v, [d.id]: e.target.value }))}
                        className="w-24"
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleSaisirResultat(d.id)}
                        disabled={busyId === d.id}
                      >
                        Saisir
                      </Button>
                    </span>
                  )}
                  {d.statut === "valide_technicien" && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleValider(d.id)}
                      disabled={busyId === d.id}
                    >
                      Valider (biologiste)
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
                      Annuler
                    </Button>
                  )}
                </div>
              </td>
            </tr>
          ))}
          {demandes.length === 0 && (
            <tr>
              <td colSpan={5} className="py-2 px-4 text-muted">
                Aucune demande en cours.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </Card>
  );
}
