"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { FacturationAction } from "./FacturationAction";
import { fetchPatientFactures } from "./caisse-api";
import type { Facture } from "./types";

const STATUT_LABELS: Record<Facture["statut"], string> = {
  ouverte: "Ouverte",
  partiellement_payee: "Partiellement payée",
  payee: "Payée",
  annulee: "Annulée",
};

export function PatientFactures({ patientId }: { patientId: number }) {
  const [factures, setFactures] = useState<Facture[] | null>(null);

  useEffect(() => {
    fetchPatientFactures(patientId).then((res) => setFactures(res.data));
  }, [patientId]);

  if (factures === null) return null;

  return (
    <div>
      <h2 className="font-semibold mb-2">Facturation</h2>
      <ul className="flex flex-col gap-1 mb-3 text-sm">
        {factures.map((f) => (
          <li key={f.id} className="border rounded p-2">
            <Link href={`/factures/${f.id}`} className="font-medium text-blue-600 underline">
              Facture #{f.id}
            </Link>{" "}
            <span className="text-gray-500">
              {f.montant_total} F CFA — {STATUT_LABELS[f.statut]}
            </span>
          </li>
        ))}
        {factures.length === 0 && <li className="text-gray-500">Aucune facture.</li>}
      </ul>
      <FacturationAction patientId={patientId} />
    </div>
  );
}
