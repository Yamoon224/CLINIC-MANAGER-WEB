"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { FacturationAction } from "./FacturationAction";
import { fetchPatientFactures } from "./caisse-api";
import type { Facture } from "./types";
import { Badge } from "@/components/ui";

const STATUT_LABELS: Record<Facture["statut"], string> = {
  ouverte: "Ouverte",
  partiellement_payee: "Partiellement payée",
  payee: "Payée",
  annulee: "Annulée",
};

const STATUT_TONES: Record<Facture["statut"], "primary" | "warning" | "success" | "neutral"> = {
  ouverte: "primary",
  partiellement_payee: "warning",
  payee: "success",
  annulee: "neutral",
};

export function PatientFactures({ patientId }: { patientId: number }) {
  const [factures, setFactures] = useState<Facture[] | null>(null);

  useEffect(() => {
    fetchPatientFactures(patientId).then((res) => setFactures(res.data));
  }, [patientId]);

  if (factures === null) return null;

  return (
    <div>
      <h2 className="font-semibold mb-2 text-foreground">Facturation</h2>
      <ul className="flex flex-col gap-2 mb-3 text-sm">
        {factures.map((f) => (
          <li
            key={f.id}
            className="flex items-center justify-between rounded-xl border border-border bg-surface p-3"
          >
            <Link href={`/factures/${f.id}`} className="font-medium text-primary hover:underline">
              Facture #{f.id}
            </Link>
            <span className="flex items-center gap-2 text-muted">
              {f.montant_total} F CFA
              <Badge tone={STATUT_TONES[f.statut]}>{STATUT_LABELS[f.statut]}</Badge>
            </span>
          </li>
        ))}
        {factures.length === 0 && <li className="text-muted">Aucune facture.</li>}
      </ul>
      <FacturationAction patientId={patientId} />
    </div>
  );
}
