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
    <ul className="flex flex-col gap-1 text-sm max-w-lg">
      {creances.map((f) => (
        <li key={f.id} className="border rounded p-2 flex justify-between">
          <Link href={`/factures/${f.id}`} className="text-blue-600 underline">
            {f.patient.prenom} {f.patient.nom} - Facture #{f.id}
          </Link>
          <span className="font-medium">{f.solde} F CFA dû</span>
        </li>
      ))}
      {creances.length === 0 && <li className="text-gray-500">Aucun impayé.</li>}
    </ul>
  );
}
