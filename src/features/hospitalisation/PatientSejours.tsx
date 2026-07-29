"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AdmissionAction } from "./AdmissionAction";
import { fetchPatientSejours } from "./hospitalisation-api";
import type { Sejour } from "./types";

export function PatientSejours({ patientId }: { patientId: number }) {
  const [sejours, setSejours] = useState<Sejour[] | null>(null);

  useEffect(() => {
    fetchPatientSejours(patientId).then((res) => setSejours(res.data));
  }, [patientId]);

  if (sejours === null) return null;

  const enCours = sejours.some((s) => s.statut === "en_cours");

  return (
    <div>
      <h2 className="font-semibold mb-2">Hospitalisation</h2>
      <ul className="flex flex-col gap-1 mb-3 text-sm">
        {sejours.map((s) => (
          <li key={s.id} className="border rounded p-2">
            <Link href={`/sejours/${s.id}`} className="font-medium text-blue-600 underline">
              Chambre {s.lit.chambre} — {s.lit.numero}
            </Link>{" "}
            <span className="text-gray-500">
              {s.statut === "en_cours" ? "en cours" : `${s.nombre_jours} jour(s)`}
            </span>
          </li>
        ))}
        {sejours.length === 0 && (
          <li className="text-gray-500">Aucune hospitalisation.</li>
        )}
      </ul>
      {!enCours && <AdmissionAction patientId={patientId} />}
    </div>
  );
}
