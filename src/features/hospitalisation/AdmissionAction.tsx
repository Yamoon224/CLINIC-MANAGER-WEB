"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { admettre, fetchLits } from "./hospitalisation-api";
import type { Lit } from "./types";
import { Button, Card, Field, Input, Select } from "@/components/ui";

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
    <Card className="flex flex-col gap-3 max-w-md">
      <span className="font-semibold text-sm">Admettre en hospitalisation</span>
      <Field label="Lit">
        <Select
          value={litId}
          onChange={(e) => setLitId(e.target.value ? Number(e.target.value) : "")}
        >
          <option value="">Lit disponible...</option>
          {lits.map((l) => (
            <option key={l.id} value={l.id}>
              Chambre {l.chambre} - {l.numero}
            </option>
          ))}
        </Select>
      </Field>
      <Field label="Motif">
        <Input
          placeholder="Motif d'hospitalisation"
          value={motif}
          onChange={(e) => setMotif(e.target.value)}
        />
      </Field>
      {error && (
        <p className="rounded-lg bg-danger-light px-3 py-2 text-sm text-danger">{error}</p>
      )}
      <Button onClick={handleSubmit} disabled={isSubmitting || lits.length === 0} className="self-start">
        Admettre
      </Button>
      {lits.length === 0 && (
        <p className="text-sm text-muted">Aucun lit disponible actuellement.</p>
      )}
    </Card>
  );
}
