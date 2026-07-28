"use client";

import { useEffect, useState } from "react";
import { addReleveTemperature, fetchChaineFroid } from "./vaccinations-api";
import type { ReleveTemperature } from "./types";

export function ChaineFroid() {
  const [releves, setReleves] = useState<ReleveTemperature[]>([]);
  const [temperature, setTemperature] = useState("");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  function load() {
    fetchChaineFroid().then((res) => setReleves(res.data));
  }

  useEffect(() => {
    load();
  }, []);

  async function handleSubmit() {
    if (!temperature) return;
    setIsSubmitting(true);
    try {
      await addReleveTemperature({
        releve_at: new Date().toISOString(),
        temperature: Number(temperature),
        notes: notes || undefined,
      });
      setTemperature("");
      setNotes("");
      load();
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="border rounded p-3 flex items-center gap-2 max-w-lg">
        <input
          placeholder="Température (°C)"
          value={temperature}
          onChange={(e) => setTemperature(e.target.value)}
          className="border rounded px-3 py-2 w-40"
        />
        <input
          placeholder="Notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="border rounded px-3 py-2 flex-1"
        />
        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="border rounded px-3 py-2 whitespace-nowrap disabled:opacity-50"
        >
          Enregistrer le relevé
        </button>
      </div>

      <ul className="flex flex-col gap-1 text-sm max-w-lg">
        {releves.map((r) => (
          <li
            key={r.id}
            className={`border rounded p-2 flex justify-between ${r.anomalie ? "border-red-300 bg-red-50" : ""}`}
          >
            <span>
              {r.releve_at && new Date(r.releve_at).toLocaleString("fr-FR")} — {r.temperature}°C
              {r.anomalie && <span className="text-red-700 font-medium"> ⚠ hors plage</span>}
            </span>
          </li>
        ))}
        {releves.length === 0 && (
          <li className="text-gray-500">Aucun relevé enregistré.</li>
        )}
      </ul>
    </div>
  );
}
