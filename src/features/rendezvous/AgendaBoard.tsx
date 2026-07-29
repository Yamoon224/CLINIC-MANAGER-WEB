"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { Badge, Card, Input, PageHeader } from "@/components/ui";
import { changerStatutRendezVous, fetchAgenda } from "./rendezvous-api";
import {
  RENDEZ_VOUS_STATUT_LABELS,
  RENDEZ_VOUS_TYPE_LABELS,
  type RendezVous,
  type RendezVousStatut,
} from "./types";

const NEXT_STATUS: Partial<Record<RendezVous["statut"], RendezVous["statut"]>> = {
  programme: "confirme",
  confirme: "arrive",
  arrive: "en_consultation",
  en_consultation: "honore",
};

const STATUT_TONE: Record<RendezVousStatut, "primary" | "accent" | "success" | "warning" | "danger" | "neutral"> = {
  programme: "neutral",
  confirme: "primary",
  arrive: "warning",
  en_consultation: "accent",
  honore: "success",
  absent: "danger",
  annule: "danger",
  reporte: "warning",
};

export function AgendaBoard() {
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [rendezVous, setRendezVous] = useState<RendezVous[]>([]);
  const [busyId, setBusyId] = useState<number | null>(null);

  const reload = useCallback(() => {
    fetchAgenda(date).then((res) => setRendezVous(res.data));
  }, [date]);

  useEffect(() => {
    reload();
  }, [reload]);

  async function handleAdvance(rdv: RendezVous) {
    const next = NEXT_STATUS[rdv.statut];
    if (!next) return;
    setBusyId(rdv.id);
    try {
      await changerStatutRendezVous(rdv.id, next);
      reload();
    } finally {
      setBusyId(null);
    }
  }

  async function handleCancel(rdv: RendezVous) {
    setBusyId(rdv.id);
    try {
      await changerStatutRendezVous(rdv.id, "annule");
      reload();
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title="Agenda"
        actions={
          <Link
            href="/rendez-vous/new"
            className="inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white shadow-sm shadow-primary/20 transition-colors hover:bg-primary-hover"
          >
            + Nouveau rendez-vous
          </Link>
        }
      />

      <Input
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        className="max-w-xs"
      />

      <Card className="p-0 overflow-hidden">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="text-left border-b border-border bg-primary-light/40">
              <th className="py-2.5 px-4 font-semibold text-foreground/90">Heure</th>
              <th className="py-2.5 px-4 font-semibold text-foreground/90">Patient</th>
              <th className="py-2.5 px-4 font-semibold text-foreground/90">Praticien</th>
              <th className="py-2.5 px-4 font-semibold text-foreground/90">Type</th>
              <th className="py-2.5 px-4 font-semibold text-foreground/90">Statut</th>
              <th className="py-2.5 px-4"></th>
            </tr>
          </thead>
          <tbody>
            {rendezVous.map((rdv) => (
              <tr key={rdv.id} className="border-b border-border last:border-0 hover:bg-primary-light/40">
                <td className="py-2.5 px-4">
                  {new Date(rdv.starts_at).toLocaleTimeString("fr-FR", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </td>
                <td className="py-2.5 px-4">
                  {rdv.patient.prenom} {rdv.patient.nom}
                </td>
                <td className="py-2.5 px-4">{rdv.praticien.name}</td>
                <td className="py-2.5 px-4">{RENDEZ_VOUS_TYPE_LABELS[rdv.type]}</td>
                <td className="py-2.5 px-4">
                  <Badge tone={STATUT_TONE[rdv.statut]}>
                    {RENDEZ_VOUS_STATUT_LABELS[rdv.statut]}
                  </Badge>
                </td>
                <td className="py-2.5 px-4">
                  <div className="flex gap-3">
                    {NEXT_STATUS[rdv.statut] && (
                      <button
                        onClick={() => handleAdvance(rdv)}
                        disabled={busyId === rdv.id}
                        className="text-primary hover:underline disabled:opacity-50"
                      >
                        {RENDEZ_VOUS_STATUT_LABELS[NEXT_STATUS[rdv.statut]!]}
                      </button>
                    )}
                    {!["honore", "annule", "absent"].includes(rdv.statut) && (
                      <button
                        onClick={() => handleCancel(rdv)}
                        disabled={busyId === rdv.id}
                        className="text-danger hover:underline disabled:opacity-50"
                      >
                        Annuler
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {rendezVous.length === 0 && (
          <p className="text-sm text-muted p-4">Aucun rendez-vous ce jour-là.</p>
        )}
      </Card>
    </div>
  );
}
