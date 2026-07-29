"use client";

import { useEffect, useState } from "react";
import { fetchAlertes } from "./pharmacie-api";
import type { Alertes } from "./types";
import { Badge } from "@/components/ui";

export function AlertesStock() {
  const [alertes, setAlertes] = useState<Alertes | null>(null);

  useEffect(() => {
    fetchAlertes().then(setAlertes);
  }, []);

  if (!alertes) return null;

  return (
    <div className="flex flex-col gap-4 max-w-2xl">
      <div>
        <h3 className="font-medium text-foreground mb-2">Ruptures / stock sous le seuil</h3>
        <ul className="text-sm flex flex-col gap-2">
          {alertes.ruptures.map((m) => (
            <li
              key={m.id}
              className="flex items-center justify-between rounded-lg border border-danger/30 bg-danger-light p-2"
            >
              <span>
                {m.dci} - {m.stock_disponible} restant(s) (seuil {m.seuil_alerte})
              </span>
              <Badge tone="danger">Rupture</Badge>
            </li>
          ))}
          {alertes.ruptures.length === 0 && (
            <li className="text-muted">Aucune rupture.</li>
          )}
        </ul>
      </div>

      <div>
        <h3 className="font-medium text-foreground mb-2">Péremptions proches (30 jours)</h3>
        <ul className="text-sm flex flex-col gap-2">
          {alertes.peremptions_proches.map((lot) => (
            <li
              key={lot.id}
              className="flex items-center justify-between rounded-lg border border-warning/30 bg-warning-light p-2"
            >
              <span>
                {lot.medicament.dci} - lot {lot.numero_lot} - {lot.date_peremption} (
                {lot.quantite_restante} restant(s))
              </span>
              <Badge tone="warning">Péremption proche</Badge>
            </li>
          ))}
          {alertes.peremptions_proches.length === 0 && (
            <li className="text-muted">Aucune péremption proche.</li>
          )}
        </ul>
      </div>
    </div>
  );
}
