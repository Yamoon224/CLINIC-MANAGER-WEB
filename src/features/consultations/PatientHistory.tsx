"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { fetchPatientHistory } from "./consultations-api";
import type { Consultation } from "./types";
import { Card } from "@/components/ui";

export function PatientHistory({ patientId }: { patientId: number }) {
  const [consultations, setConsultations] = useState<Consultation[] | null>(null);

  useEffect(() => {
    fetchPatientHistory(patientId).then((res) => setConsultations(res.data));
  }, [patientId]);

  if (consultations === null) {
    return <p className="text-sm text-muted">Chargement de l&apos;historique...</p>;
  }

  if (consultations.length === 0) {
    return <p className="text-sm text-muted">Aucune consultation enregistrée.</p>;
  }

  return (
    <ul className="flex flex-col gap-2">
      {consultations.map((c) => (
        <li key={c.id}>
          <Card className="p-3 text-sm">
            <div className="flex items-center justify-between">
              <Link href={`/consultations/${c.id}`} className="font-semibold text-primary hover:underline">
                {c.motif}
              </Link>
              <span className="text-muted">
                {c.started_at &&
                  new Date(c.started_at).toLocaleString("fr-FR", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
              </span>
            </div>
            <p className="text-muted">
              Dr {c.praticien.name}
              {c.diagnostic && <> - {c.diagnostic}</>}
            </p>
          </Card>
        </li>
      ))}
    </ul>
  );
}
