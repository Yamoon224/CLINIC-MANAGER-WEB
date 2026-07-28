"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { changerStatutRendezVous, fetchAgenda } from "./rendezvous-api";
import {
  RENDEZ_VOUS_STATUT_LABELS,
  RENDEZ_VOUS_TYPE_LABELS,
  type RendezVous,
} from "./types";

const NEXT_STATUS: Partial<Record<RendezVous["statut"], RendezVous["statut"]>> = {
  programme: "confirme",
  confirme: "arrive",
  arrive: "en_consultation",
  en_consultation: "honore",
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
      <div className="flex items-center justify-between gap-4">
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="border rounded px-3 py-2"
        />
        <Link
          href="/rendez-vous/new"
          className="bg-blue-600 text-white rounded px-3 py-2 whitespace-nowrap"
        >
          + Nouveau rendez-vous
        </Link>
      </div>

      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="text-left border-b">
            <th className="py-2 pr-4">Heure</th>
            <th className="py-2 pr-4">Patient</th>
            <th className="py-2 pr-4">Praticien</th>
            <th className="py-2 pr-4">Type</th>
            <th className="py-2 pr-4">Statut</th>
            <th className="py-2 pr-4"></th>
          </tr>
        </thead>
        <tbody>
          {rendezVous.map((rdv) => (
            <tr key={rdv.id} className="border-b">
              <td className="py-2 pr-4">
                {new Date(rdv.starts_at).toLocaleTimeString("fr-FR", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </td>
              <td className="py-2 pr-4">
                {rdv.patient.prenom} {rdv.patient.nom}
              </td>
              <td className="py-2 pr-4">{rdv.praticien.name}</td>
              <td className="py-2 pr-4">{RENDEZ_VOUS_TYPE_LABELS[rdv.type]}</td>
              <td className="py-2 pr-4">{RENDEZ_VOUS_STATUT_LABELS[rdv.statut]}</td>
              <td className="py-2 pr-4 flex gap-3">
                {NEXT_STATUS[rdv.statut] && (
                  <button
                    onClick={() => handleAdvance(rdv)}
                    disabled={busyId === rdv.id}
                    className="underline disabled:opacity-50"
                  >
                    {RENDEZ_VOUS_STATUT_LABELS[NEXT_STATUS[rdv.statut]!]}
                  </button>
                )}
                {!["honore", "annule", "absent"].includes(rdv.statut) && (
                  <button
                    onClick={() => handleCancel(rdv)}
                    disabled={busyId === rdv.id}
                    className="underline text-red-600 disabled:opacity-50"
                  >
                    Annuler
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {rendezVous.length === 0 && (
        <p className="text-sm text-gray-500">Aucun rendez-vous ce jour-là.</p>
      )}
    </div>
  );
}
