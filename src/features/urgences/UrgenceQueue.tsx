"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { Badge, Card } from "@/components/ui";
import { fetchFileAttente } from "./urgences-api";
import {
  NIVEAU_TRIAGE_LABELS,
  type AdmissionUrgence,
  type NiveauTriage,
} from "./types";

const TRIAGE_TONE: Record<NiveauTriage, "primary" | "accent" | "success" | "warning" | "danger"> = {
  reanimation: "danger",
  tres_urgent: "danger",
  urgent: "warning",
  semi_urgent: "primary",
  non_urgent: "success",
};

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
    <div className="flex flex-col gap-3">
      {admissions.map((a) => (
        <Link key={a.id} href={`/urgences/${a.id}`}>
          <Card className="flex items-center justify-between hover:bg-primary-light/40 transition-colors">
            <div className="flex items-center gap-3">
              {a.niveau_triage ? (
                <Badge tone={TRIAGE_TONE[a.niveau_triage]}>
                  {NIVEAU_TRIAGE_LABELS[a.niveau_triage]}
                </Badge>
              ) : (
                <Badge tone="neutral">À trier</Badge>
              )}
              <span className="text-foreground">
                {a.patient.prenom} {a.patient.nom}
              </span>
              <span className="text-sm text-muted">{a.patient.numero_dossier}</span>
            </div>
            <span className="text-sm text-muted">
              {a.admitted_at &&
                new Date(a.admitted_at).toLocaleTimeString("fr-FR", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
            </span>
          </Card>
        </Link>
      ))}

      {admissions.length === 0 && (
        <p className="text-sm text-muted">Aucun patient aux urgences actuellement.</p>
      )}
    </div>
  );
}
