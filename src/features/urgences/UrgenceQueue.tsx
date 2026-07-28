"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { fetchFileAttente } from "./urgences-api";
import {
  NIVEAU_TRIAGE_COLORS,
  NIVEAU_TRIAGE_LABELS,
  type AdmissionUrgence,
} from "./types";

export function UrgenceQueue() {
  const [admissions, setAdmissions] = useState<AdmissionUrgence[]>([]);

  const reload = useCallback(() => {
    fetchFileAttente().then((res) => setAdmissions(res.data));
  }, []);

  useEffect(() => {
    reload();
    const interval = setInterval(reload, 5000);
    return () => clearInterval(interval);
  }, [reload]);

  return (
    <div className="flex flex-col gap-2">
      {admissions.map((a) => (
        <Link
          key={a.id}
          href={`/urgences/${a.id}`}
          className="border rounded p-3 flex items-center justify-between hover:bg-gray-50"
        >
          <div className="flex items-center gap-3">
            {a.niveau_triage ? (
              <span
                className={`text-xs font-semibold px-2 py-1 rounded ${NIVEAU_TRIAGE_COLORS[a.niveau_triage]}`}
              >
                {NIVEAU_TRIAGE_LABELS[a.niveau_triage]}
              </span>
            ) : (
              <span className="text-xs font-semibold px-2 py-1 rounded bg-gray-300 text-black">
                À trier
              </span>
            )}
            <span>
              {a.patient.prenom} {a.patient.nom}
            </span>
            <span className="text-sm text-gray-500">{a.patient.numero_dossier}</span>
          </div>
          <span className="text-sm text-gray-500">
            {a.admitted_at &&
              new Date(a.admitted_at).toLocaleTimeString("fr-FR", {
                hour: "2-digit",
                minute: "2-digit",
              })}
          </span>
        </Link>
      ))}

      {admissions.length === 0 && (
        <p className="text-sm text-gray-500">Aucun patient aux urgences actuellement.</p>
      )}
    </div>
  );
}
