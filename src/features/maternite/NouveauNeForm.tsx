"use client";

import { useState } from "react";
import { addNouveauNe } from "./maternite-api";
import { Button, Field, Input, Select } from "@/components/ui";

export function NouveauNeForm({
  accouchementId,
  onAdded,
}: {
  accouchementId: number;
  onAdded: () => void;
}) {
  const [sexe, setSexe] = useState<"M" | "F" | "">("");
  const [poids, setPoids] = useState("");
  const [taille, setTaille] = useState("");
  const [apgar1, setApgar1] = useState("");
  const [apgar5, setApgar5] = useState("");
  const [vaccinations, setVaccinations] = useState("BCG, Polio 0");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setIsSubmitting(true);
    try {
      await addNouveauNe(accouchementId, {
        sexe: sexe || undefined,
        poids: poids ? Number(poids) : undefined,
        taille: taille ? Number(taille) : undefined,
        score_apgar_1min: apgar1 ? Number(apgar1) : undefined,
        score_apgar_5min: apgar5 ? Number(apgar5) : undefined,
        vaccinations_naissance: vaccinations || undefined,
      });
      onAdded();
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex max-w-lg flex-col gap-3 rounded-2xl border border-border bg-surface p-5 shadow-sm"
    >
      <div className="grid grid-cols-3 gap-3">
        <Field label="Sexe">
          <Select value={sexe} onChange={(e) => setSexe(e.target.value as "M" | "F" | "")}>
            <option value="">Sexe</option>
            <option value="F">Féminin</option>
            <option value="M">Masculin</option>
          </Select>
        </Field>
        <Field label="Poids (kg)">
          <Input
            placeholder="Poids (kg)"
            value={poids}
            onChange={(e) => setPoids(e.target.value)}
          />
        </Field>
        <Field label="Taille (cm)">
          <Input
            placeholder="Taille (cm)"
            value={taille}
            onChange={(e) => setTaille(e.target.value)}
          />
        </Field>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Score Apgar 1 min">
          <Input
            placeholder="Score Apgar 1 min"
            value={apgar1}
            onChange={(e) => setApgar1(e.target.value)}
          />
        </Field>
        <Field label="Score Apgar 5 min">
          <Input
            placeholder="Score Apgar 5 min"
            value={apgar5}
            onChange={(e) => setApgar5(e.target.value)}
          />
        </Field>
      </div>
      <Field label="Vaccinations de naissance">
        <Input
          placeholder="Vaccinations de naissance"
          value={vaccinations}
          onChange={(e) => setVaccinations(e.target.value)}
        />
      </Field>
      <Button type="submit" disabled={isSubmitting} className="self-start">
        Ajouter le nouveau-né
      </Button>
    </form>
  );
}
