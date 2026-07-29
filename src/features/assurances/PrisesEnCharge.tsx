"use client";

import { useEffect, useState } from "react";
import { fetchPrisesEnCharge, traiterPriseEnCharge } from "./assurances-api";
import type { PriseEnCharge, PriseEnChargeStatut } from "./types";

const STATUT_LABELS: Record<PriseEnChargeStatut, string> = {
  en_attente: "En attente",
  approuvee: "Approuvée",
  refusee: "Refusée",
};

export function PrisesEnCharge() {
  const [statut, setStatut] = useState<PriseEnChargeStatut | "">("en_attente");
  const [prises, setPrises] = useState<PriseEnCharge[]>([]);
  const [busyId, setBusyId] = useState<number | null>(null);

  function load() {
    fetchPrisesEnCharge(statut || undefined).then((res) => setPrises(res.data));
  }

  useEffect(() => {
    fetchPrisesEnCharge(statut || undefined).then((res) => setPrises(res.data));
  }, [statut]);

  async function handleTraiter(id: number, decision: "approuvee" | "refusee") {
    setBusyId(id);
    try {
      await traiterPriseEnCharge(id, decision);
      load();
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="flex flex-col gap-3 max-w-2xl">
      <select
        value={statut}
        onChange={(e) => setStatut(e.target.value as PriseEnChargeStatut | "")}
        className="border rounded px-3 py-2 w-56"
      >
        <option value="">Tous statuts</option>
        {Object.entries(STATUT_LABELS).map(([value, label]) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </select>

      <ul className="flex flex-col gap-2 text-sm">
        {prises.map((p) => (
          <li key={p.id} className="border rounded p-2">
            <div className="flex items-center justify-between">
              <span className="font-medium">{p.numero}</span>
              <span className="text-xs text-gray-500">{STATUT_LABELS[p.statut]}</span>
            </div>
            <div className="text-xs text-gray-600">
              {p.assurance_patient.patient &&
                `${p.assurance_patient.patient.prenom} ${p.assurance_patient.patient.nom} - `}
              {p.assurance_patient.compagnie.nom}
            </div>
            <div className="text-xs">
              {p.motif}
              {p.montant_plafond && ` (plafond ${p.montant_plafond} F CFA)`}
            </div>
            {p.statut === "en_attente" && (
              <div className="flex gap-2 mt-2">
                <button
                  onClick={() => handleTraiter(p.id, "approuvee")}
                  disabled={busyId === p.id}
                  className="border rounded px-2 py-1 text-xs text-green-700 disabled:opacity-50"
                >
                  Approuver
                </button>
                <button
                  onClick={() => handleTraiter(p.id, "refusee")}
                  disabled={busyId === p.id}
                  className="border rounded px-2 py-1 text-xs text-red-700 disabled:opacity-50"
                >
                  Refuser
                </button>
              </div>
            )}
          </li>
        ))}
        {prises.length === 0 && <li className="text-gray-500">Aucune prise en charge.</li>}
      </ul>
    </div>
  );
}
