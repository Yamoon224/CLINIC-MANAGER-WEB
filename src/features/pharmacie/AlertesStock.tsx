"use client";

import { useEffect, useState } from "react";
import { fetchAlertes } from "./pharmacie-api";
import type { Alertes } from "./types";

export function AlertesStock() {
  const [alertes, setAlertes] = useState<Alertes | null>(null);

  useEffect(() => {
    fetchAlertes().then(setAlertes);
  }, []);

  if (!alertes) return null;

  return (
    <div className="flex flex-col gap-4 max-w-2xl">
      <div>
        <h3 className="font-medium mb-1">Ruptures / stock sous le seuil</h3>
        <ul className="text-sm flex flex-col gap-1">
          {alertes.ruptures.map((m) => (
            <li key={m.id} className="border border-red-300 bg-red-50 rounded p-2">
              {m.dci} — {m.stock_disponible} restant(s) (seuil {m.seuil_alerte})
            </li>
          ))}
          {alertes.ruptures.length === 0 && (
            <li className="text-gray-500">Aucune rupture.</li>
          )}
        </ul>
      </div>

      <div>
        <h3 className="font-medium mb-1">Péremptions proches (30 jours)</h3>
        <ul className="text-sm flex flex-col gap-1">
          {alertes.peremptions_proches.map((lot) => (
            <li key={lot.id} className="border border-orange-300 bg-orange-50 rounded p-2">
              {lot.medicament.dci} — lot {lot.numero_lot} — {lot.date_peremption} (
              {lot.quantite_restante} restant(s))
            </li>
          ))}
          {alertes.peremptions_proches.length === 0 && (
            <li className="text-gray-500">Aucune péremption proche.</li>
          )}
        </ul>
      </div>
    </div>
  );
}
