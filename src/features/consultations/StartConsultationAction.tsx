"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { startConsultation } from "./consultations-api";
import { Button, Card, Input } from "@/components/ui";

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
    <Card className="flex flex-col gap-2 max-w-md p-4">
      <span className="font-semibold text-sm text-foreground">Démarrer une consultation</span>
      <div className="flex items-center gap-2">
        <Input
          placeholder="Motif de la consultation"
          value={motif}
          onChange={(e) => setMotif(e.target.value)}
          className="flex-1"
        />
        <Button onClick={handleStart} disabled={isSubmitting} className="whitespace-nowrap">
          {isSubmitting ? "..." : "Démarrer"}
        </Button>
      </div>
      {error && <p className="text-sm text-danger">{error}</p>}
    </Card>
  );
}
