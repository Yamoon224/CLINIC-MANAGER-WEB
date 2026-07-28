"use client";

import { useState } from "react";
import { addCpn } from "./maternite-api";

export function CpnForm({
  grossesseId,
  onAdded,
}: {
  grossesseId: number;
  onAdded: () => void;
}) {
  const [dateCpn, setDateCpn] = useState(new Date().toISOString().slice(0, 10));
  const [poids, setPoids] = useState("");
  const [tension, setTension] = useState("");
  const [hauteurUterine, setHauteurUterine] = useState("");
  const [bruitsCoeurFoetal, setBruitsCoeurFoetal] = useState("");
  const [risqueDetecte, setRisqueDetecte] = useState(false);
  const [risqueDetails, setRisqueDetails] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setIsSubmitting(true);
    try {
      await addCpn(grossesseId, {
        date_cpn: dateCpn,
        poids: poids ? Number(poids) : undefined,
        tension: tension || undefined,
        hauteur_uterine: hauteurUterine ? Number(hauteurUterine) : undefined,
        bruits_coeur_foetal: bruitsCoeurFoetal || undefined,
        risque_detecte: risqueDetecte,
        risque_details: risqueDetails || undefined,
      });
      setPoids("");
      setTension("");
      setHauteurUterine("");
      setBruitsCoeurFoetal("");
      setRisqueDetecte(false);
      setRisqueDetails("");
      onAdded();
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="border rounded p-3 flex flex-col gap-2">
      <div className="grid grid-cols-4 gap-2">
        <input
          type="date"
          value={dateCpn}
          onChange={(e) => setDateCpn(e.target.value)}
          className="border rounded px-3 py-2"
        />
        <input
          placeholder="Poids"
          value={poids}
          onChange={(e) => setPoids(e.target.value)}
          className="border rounded px-3 py-2"
        />
        <input
          placeholder="Tension"
          value={tension}
          onChange={(e) => setTension(e.target.value)}
          className="border rounded px-3 py-2"
        />
        <input
          placeholder="Hauteur utérine"
          value={hauteurUterine}
          onChange={(e) => setHauteurUterine(e.target.value)}
          className="border rounded px-3 py-2"
        />
      </div>
      <input
        placeholder="Bruits du cœur fœtal"
        value={bruitsCoeurFoetal}
        onChange={(e) => setBruitsCoeurFoetal(e.target.value)}
        className="border rounded px-3 py-2"
      />
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={risqueDetecte}
          onChange={(e) => setRisqueDetecte(e.target.checked)}
        />
        Grossesse à risque détectée lors de cette CPN
      </label>
      {risqueDetecte && (
        <textarea
          placeholder="Détails du risque"
          value={risqueDetails}
          onChange={(e) => setRisqueDetails(e.target.value)}
          className="border rounded px-3 py-2"
          rows={2}
        />
      )}
      <button
        type="submit"
        disabled={isSubmitting}
        className="border rounded px-3 py-2 self-start disabled:opacity-50"
      >
        Ajouter la CPN
      </button>
    </form>
  );
}
