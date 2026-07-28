"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { fetchPatientHistory } from "./consultations-api";
import type { Consultation } from "./types";

export function PatientHistory({ patientId }: { patientId: number }) {
  const [consultations, setConsultations] = useState<Consultation[] | null>(null);

  useEffect(() => {
    fetchPatientHistory(patientId).then((res) => setConsultations(res.data));
  }, [patientId]);

  if (consultations === null) {
    return <p className="text-sm text-gray-500">Chargement de l&apos;historique...</p>;
  }

  if (consultations.length === 0) {
    return <p className="text-sm text-gray-500">Aucune consultation enregistrée.</p>;
  }

  return (
    <ul className="flex flex-col gap-2">
      {consultations.map((c) => (
        <li key={c.id} className="border rounded p-3 text-sm">
          <div className="flex items-center justify-between">
            <Link href={`/consultations/${c.id}`} className="font-semibold text-blue-600 underline">
              {c.motif}
            </Link>
            <span className="text-gray-500">
              {c.started_at &&
                new Date(c.started_at).toLocaleString("fr-FR", {
                  dateStyle: "medium",
                  timeStyle: "short",
                })}
            </span>
          </div>
          <p className="text-gray-600">
            Dr {c.praticien.name}
            {c.diagnostic && <> — {c.diagnostic}</>}
          </p>
        </li>
      ))}
    </ul>
  );
}
