"use client";

import { useCallback, useEffect, useState } from "react";
import { DispensationForm } from "./DispensationForm";
import { fetchPatientDispensations } from "./pharmacie-api";
import type { Dispensation } from "./types";
import { Badge } from "@/components/ui";

export function PatientDispensations({ patientId }: { patientId: number }) {
  const [dispensations, setDispensations] = useState<Dispensation[] | null>(null);

  const load = useCallback(() => {
    fetchPatientDispensations(patientId).then((res) => setDispensations(res.data));
  }, [patientId]);

  useEffect(() => {
    load();
  }, [load]);

  if (dispensations === null) return null;

  return (
    <div>
      <h2 className="font-semibold text-foreground mb-2">Pharmacie</h2>
      <ul className="flex flex-col gap-2 mb-3 text-sm">
        {dispensations.map((d) => (
          <li key={d.id} className="rounded-lg border border-border p-2">
            <span className="font-medium text-foreground">
              {d.medicament.dci} × {d.quantite}
            </span>{" "}
            <span className="text-muted">
              {d.created_at && new Date(d.created_at).toLocaleDateString("fr-FR")}
            </span>
            {d.est_substitution && d.medicament_original && (
              <p className="mt-1">
                <Badge tone="warning">
                  Substitué à {d.medicament_original.dci} (rupture)
                </Badge>
              </p>
            )}
          </li>
        ))}
        {dispensations.length === 0 && (
          <li className="text-muted">Aucune dispensation.</li>
        )}
      </ul>
      <DispensationForm patientId={patientId} onDispensed={load} />
    </div>
  );
}
