"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { admettre, fetchLits } from "./hospitalisation-api";
import type { Lit } from "./types";

export function AdmissionAction({ patientId }: { patientId: number }) {
  const router = useRouter();
  const [lits, setLits] = useState<Lit[]>([]);
  const [litId, setLitId] = useState<number | "">("");
  const [motif, setMotif] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchLits().then((res) => setLits(res.data.filter((l) => l.statut === "libre")));
  }, []);

  async function handleSubmit() {
    if (!litId || !motif.trim()) {
      setError("Lit et motif sont requis.");
      return;
    }
    setIsSubmitting(true);
    setError(null);
    try {
      const { data } = await admettre(patientId, { lit_id: litId, motif });
      router.push(`/sejours/${data.id}`);
    } catch {
      setError("Impossible d'admettre le patient.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="border rounded p-4 flex flex-col gap-2 max-w-md">
      <span className="font-semibold text-sm">Admettre en hospitalisation</span>
      <select
        value={litId}
        onChange={(e) => setLitId(e.target.value ? Number(e.target.value) : "")}
        className="border rounded px-3 py-2"
      >
        <option value="">Lit disponible...</option>
        {lits.map((l) => (
          <option key={l.id} value={l.id}>
            Chambre {l.chambre} — {l.numero}
          </option>
        ))}
      </select>
      <input
        placeholder="Motif d'hospitalisation"
        value={motif}
        onChange={(e) => setMotif(e.target.value)}
        className="border rounded px-3 py-2"
      />
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button
        onClick={handleSubmit}
        disabled={isSubmitting || lits.length === 0}
        className="bg-blue-600 text-white rounded px-3 py-2 self-start disabled:opacity-50"
      >
        Admettre
      </button>
      {lits.length === 0 && (
        <p className="text-sm text-gray-500">Aucun lit disponible actuellement.</p>
      )}
    </div>
  );
}
