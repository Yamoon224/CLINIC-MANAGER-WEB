"use client";

import { useState } from "react";
import { createAccouchement } from "./maternite-api";
import type { ModeAccouchement } from "./types";

export function AccouchementForm({
  grossesseId,
  onSaved,
}: {
  grossesseId: number;
  onSaved: () => void;
}) {
  const [mode, setMode] = useState<ModeAccouchement>("voie_basse");
  const [dateHeure, setDateHeure] = useState(new Date().toISOString().slice(0, 16));
  const [equipe, setEquipe] = useState("");
  const [complications, setComplications] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setIsSubmitting(true);
    try {
      await createAccouchement(grossesseId, {
        mode,
        date_heure: dateHeure,
        equipe: equipe || undefined,
        complications: complications || undefined,
      });
      onSaved();
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="border rounded p-3 flex flex-col gap-2 max-w-lg">
      <div className="grid grid-cols-2 gap-2">
        <select
          value={mode}
          onChange={(e) => setMode(e.target.value as ModeAccouchement)}
          className="border rounded px-3 py-2"
        >
          <option value="voie_basse">Voie basse</option>
          <option value="cesarienne">Césarienne</option>
        </select>
        <input
          type="datetime-local"
          value={dateHeure}
          onChange={(e) => setDateHeure(e.target.value)}
          className="border rounded px-3 py-2"
        />
      </div>
      <input
        placeholder="Équipe présente"
        value={equipe}
        onChange={(e) => setEquipe(e.target.value)}
        className="border rounded px-3 py-2"
      />
      <textarea
        placeholder="Complications éventuelles"
        value={complications}
        onChange={(e) => setComplications(e.target.value)}
        className="border rounded px-3 py-2"
        rows={2}
      />
      <button
        type="submit"
        disabled={isSubmitting}
        className="bg-blue-600 text-white rounded px-3 py-2 self-start disabled:opacity-50"
      >
        Enregistrer l&apos;accouchement
      </button>
    </form>
  );
}
