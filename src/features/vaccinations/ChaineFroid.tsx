"use client";

import { useEffect, useState } from "react";
import { addReleveTemperature, fetchChaineFroid } from "./vaccinations-api";
import type { ReleveTemperature } from "./types";
import { Badge, Button, Card, Input } from "@/components/ui";

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
      <Card className="flex items-center gap-2 max-w-lg p-3">
        <Input
          placeholder="Température (°C)"
          value={temperature}
          onChange={(e) => setTemperature(e.target.value)}
          className="w-40"
        />
        <Input
          placeholder="Notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="flex-1"
        />
        <Button
          variant="outline"
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="whitespace-nowrap"
        >
          Enregistrer le relevé
        </Button>
      </Card>

      <ul className="flex flex-col gap-2 text-sm max-w-lg">
        {releves.map((r) => (
          <li
            key={r.id}
            className={`rounded-lg border p-2 flex items-center justify-between ${r.anomalie ? "border-danger/30 bg-danger-light" : "border-border"}`}
          >
            <span>
              {r.releve_at && new Date(r.releve_at).toLocaleString("fr-FR")} - {r.temperature}°C
            </span>
            {r.anomalie && <Badge tone="danger">⚠ hors plage</Badge>}
          </li>
        ))}
        {releves.length === 0 && (
          <li className="text-muted">Aucun relevé enregistré.</li>
        )}
      </ul>
    </div>
  );
}
