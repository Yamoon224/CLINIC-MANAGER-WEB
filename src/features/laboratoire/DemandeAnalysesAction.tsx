"use client";

import { useEffect, useState } from "react";
import { createDemandes, fetchAnalyseTypes } from "./laboratoire-api";
import type { AnalyseType } from "./types";
import { Button, Card } from "@/components/ui";

export function DemandeAnalysesAction({
  patientId,
  onCreated,
}: {
  patientId: number;
  onCreated?: () => void;
}) {
  const [analyseTypes, setAnalyseTypes] = useState<AnalyseType[]>([]);
  const [selected, setSelected] = useState<number[]>([]);
  const [urgente, setUrgente] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmation, setConfirmation] = useState<string | null>(null);

  useEffect(() => {
    fetchAnalyseTypes().then((res) => setAnalyseTypes(res.data));
  }, []);

  function toggle(id: number) {
    setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
  }

  async function handleSubmit() {
    if (selected.length === 0) return;
    setIsSubmitting(true);
    try {
      await createDemandes(patientId, { analyse_type_ids: selected, urgente });
      setConfirmation(`${selected.length} demande(s) transmise(s) au laboratoire.`);
      setSelected([]);
      setUrgente(false);
      onCreated?.();
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Card className="flex flex-col gap-2 max-w-md p-4">
      <span className="font-semibold text-sm text-foreground">Demander des analyses</span>
      <div className="flex flex-col gap-1 max-h-40 overflow-y-auto text-sm">
        {analyseTypes.map((a) => (
          <label key={a.id} className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={selected.includes(a.id)}
              onChange={() => toggle(a.id)}
            />
            {a.nom}
          </label>
        ))}
      </div>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={urgente} onChange={(e) => setUrgente(e.target.checked)} />
        Urgent
      </label>
      <Button
        onClick={handleSubmit}
        disabled={isSubmitting || selected.length === 0}
        className="self-start"
      >
        Envoyer au laboratoire
      </Button>
      {confirmation && <p className="text-sm text-success">{confirmation}</p>}
    </Card>
  );
}
