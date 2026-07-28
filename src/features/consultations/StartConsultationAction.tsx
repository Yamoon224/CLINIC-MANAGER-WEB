"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { startConsultation } from "./consultations-api";

export function StartConsultationAction({ patientId }: { patientId: number }) {
  const router = useRouter();
  const [motif, setMotif] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleStart() {
    if (!motif.trim()) {
      setError("Le motif est requis.");
      return;
    }
    setIsSubmitting(true);
    setError(null);
    try {
      const { data } = await startConsultation({ patient_id: patientId, motif });
      router.push(`/consultations/${data.id}`);
    } catch {
      setError("Impossible de démarrer la consultation.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="border rounded p-4 flex flex-col gap-2 max-w-md">
      <span className="font-semibold text-sm">Démarrer une consultation</span>
      <div className="flex items-center gap-2">
        <input
          placeholder="Motif de la consultation"
          value={motif}
          onChange={(e) => setMotif(e.target.value)}
          className="border rounded px-3 py-2 flex-1"
        />
        <button
          onClick={handleStart}
          disabled={isSubmitting}
          className="bg-blue-600 text-white rounded px-3 py-2 whitespace-nowrap disabled:opacity-50"
        >
          {isSubmitting ? "..." : "Démarrer"}
        </button>
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
