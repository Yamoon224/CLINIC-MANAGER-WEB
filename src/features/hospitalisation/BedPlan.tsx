"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { fetchLits, libererLit } from "./hospitalisation-api";
import type { Lit, LitStatut } from "./types";

const STATUT_LABELS: Record<LitStatut, string> = {
  libre: "Libre",
  occupe: "Occupé",
  reserve: "Réservé",
  nettoyage: "En nettoyage",
};

const STATUT_COLORS: Record<LitStatut, string> = {
  libre: "bg-green-100 border-green-300",
  occupe: "bg-red-100 border-red-300",
  reserve: "bg-yellow-100 border-yellow-300",
  nettoyage: "bg-gray-100 border-gray-300",
};

export function BedPlan() {
  const [lits, setLits] = useState<Lit[]>([]);
  const [busyId, setBusyId] = useState<number | null>(null);

  const load = useCallback(() => {
    fetchLits().then((res) => setLits(res.data));
  }, []);

  useEffect(() => {
    load();
    const interval = setInterval(load, 10000);
    return () => clearInterval(interval);
  }, [load]);

  async function handleLiberer(id: number) {
    setBusyId(id);
    try {
      await libererLit(id);
      load();
    } finally {
      setBusyId(null);
    }
  }

  const parChambre = lits.reduce<Record<string, Lit[]>>((acc, lit) => {
    (acc[lit.chambre] ??= []).push(lit);
    return acc;
  }, {});

  return (
    <div className="flex flex-col gap-6">
      {Object.entries(parChambre).map(([chambre, litsChambre]) => (
        <div key={chambre}>
          <h2 className="font-medium mb-2">Chambre {chambre}</h2>
          <div className="flex flex-wrap gap-3">
            {litsChambre.map((lit) => (
              <div
                key={lit.id}
                className={`border rounded p-3 w-56 text-sm ${STATUT_COLORS[lit.statut]}`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold">{lit.numero}</span>
                  <span>{STATUT_LABELS[lit.statut]}</span>
                </div>
                {lit.patient_actuel && (
                  <Link
                    href={`/sejours/${lit.patient_actuel.sejour_id}`}
                    className="text-blue-600 underline block mt-1"
                  >
                    {lit.patient_actuel.prenom} {lit.patient_actuel.nom}
                  </Link>
                )}
                {lit.statut === "nettoyage" && (
                  <button
                    onClick={() => handleLiberer(lit.id)}
                    disabled={busyId === lit.id}
                    className="underline mt-1 disabled:opacity-50"
                  >
                    Marquer libre
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
      {lits.length === 0 && <p className="text-gray-500">Aucun lit configuré.</p>}
    </div>
  );
}
