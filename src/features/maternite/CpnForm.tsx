"use client";

import { useState } from "react";
import { addCpn } from "./maternite-api";
import { Button, Field, Input, Textarea } from "@/components/ui";

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
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-3 rounded-2xl border border-border bg-surface p-5 shadow-sm"
    >
      <div className="grid grid-cols-4 gap-3">
        <Field label="Date">
          <Input type="date" value={dateCpn} onChange={(e) => setDateCpn(e.target.value)} />
        </Field>
        <Field label="Poids">
          <Input placeholder="Poids" value={poids} onChange={(e) => setPoids(e.target.value)} />
        </Field>
        <Field label="Tension">
          <Input
            placeholder="Tension"
            value={tension}
            onChange={(e) => setTension(e.target.value)}
          />
        </Field>
        <Field label="Hauteur utérine">
          <Input
            placeholder="Hauteur utérine"
            value={hauteurUterine}
            onChange={(e) => setHauteurUterine(e.target.value)}
          />
        </Field>
      </div>
      <Field label="Bruits du cœur fœtal">
        <Input
          placeholder="Bruits du cœur fœtal"
          value={bruitsCoeurFoetal}
          onChange={(e) => setBruitsCoeurFoetal(e.target.value)}
        />
      </Field>
      <label className="flex items-center gap-2 text-sm text-foreground">
        <input
          type="checkbox"
          checked={risqueDetecte}
          onChange={(e) => setRisqueDetecte(e.target.checked)}
          className="h-4 w-4 rounded border-border accent-primary"
        />
        Grossesse à risque détectée lors de cette CPN
      </label>
      {risqueDetecte && (
        <Field label="Détails du risque">
          <Textarea
            placeholder="Détails du risque"
            value={risqueDetails}
            onChange={(e) => setRisqueDetails(e.target.value)}
            rows={2}
          />
        </Field>
      )}
      <Button type="submit" disabled={isSubmitting} className="self-start">
        Ajouter la CPN
      </Button>
    </form>
  );
}
