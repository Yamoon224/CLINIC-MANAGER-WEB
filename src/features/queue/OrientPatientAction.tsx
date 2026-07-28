"use client";

import { useState } from "react";
import { orientPatient } from "./queue-api";
import { SERVICE_LABELS, SERVICES, type Service } from "./types";

export function OrientPatientAction({ patientId }: { patientId: number }) {
  const [service, setService] = useState<Service>(SERVICES[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [ticketLabel, setTicketLabel] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleOrient() {
    setIsSubmitting(true);
    setError(null);
    try {
      const { data } = await orientPatient(patientId, service);
      setTicketLabel(data.label);
    } catch {
      setError("Impossible de créer le ticket.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="border rounded p-4 flex flex-col gap-2 max-w-md">
      <span className="font-semibold text-sm">Orienter vers un service</span>
      <div className="flex items-center gap-2">
        <select
          value={service}
          onChange={(e) => setService(e.target.value as Service)}
          className="border rounded px-3 py-2 flex-1"
        >
          {SERVICES.map((s) => (
            <option key={s} value={s}>
              {SERVICE_LABELS[s]}
            </option>
          ))}
        </select>
        <button
          onClick={handleOrient}
          disabled={isSubmitting}
          className="bg-blue-600 text-white rounded px-3 py-2 whitespace-nowrap disabled:opacity-50"
        >
          {isSubmitting ? "..." : "Créer le ticket"}
        </button>
      </div>
      {ticketLabel && (
        <p className="text-sm text-green-700">
          Ticket créé : <span className="font-semibold">{ticketLabel}</span>
        </p>
      )}
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
