"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { fetchCreances } from "./caisse-api";
import type { Facture } from "./types";

export function Creances() {
  const [creances, setCreances] = useState<Facture[]>([]);

  useEffect(() => {
    fetchCreances().then((res) => setCreances(res.data));
  }, []);

  return (
    <ul className="flex flex-col gap-2 text-sm max-w-lg">
      {creances.map((f) => (
        <li
          key={f.id}
          className="flex items-center justify-between rounded-xl border border-border bg-surface p-3"
        >
          <Link href={`/factures/${f.id}`} className="text-primary hover:underline">
            {f.patient.prenom} {f.patient.nom} - Facture #{f.id}
          </Link>
          <span className="font-semibold text-danger">{f.solde} F CFA dû</span>
        </li>
      ))}
      {creances.length === 0 && <li className="text-muted">Aucun impayé.</li>}
    </ul>
  );
}
