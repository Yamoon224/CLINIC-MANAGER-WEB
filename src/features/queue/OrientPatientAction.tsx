"use client";

import { useState } from "react";
import { Button, Card, Select } from "@/components/ui";
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
    <Card className="flex flex-col gap-2 max-w-md">
      <span className="font-semibold text-sm text-foreground">Orienter vers un service</span>
      <div className="flex items-center gap-2">
        <Select
          value={service}
          onChange={(e) => setService(e.target.value as Service)}
          className="flex-1"
        >
          {SERVICES.map((s) => (
            <option key={s} value={s}>
              {SERVICE_LABELS[s]}
            </option>
          ))}
        </Select>
        <Button onClick={handleOrient} disabled={isSubmitting} className="whitespace-nowrap">
          {isSubmitting ? "..." : "Créer le ticket"}
        </Button>
      </div>
      {ticketLabel && (
        <p className="text-sm text-success">
          Ticket créé : <span className="font-semibold">{ticketLabel}</span>
        </p>
      )}
      {error && <p className="text-sm text-danger">{error}</p>}
    </Card>
  );
}
