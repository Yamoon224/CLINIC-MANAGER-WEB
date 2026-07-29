"use client";

import { useEffect, useState } from "react";
import { createDepense, fetchDepenses } from "./caisse-api";
import type { Depense } from "./types";
import { Button, Card, Field, Input } from "@/components/ui";

export function Depenses() {
  const [depenses, setDepenses] = useState<Depense[]>([]);
  const [categorie, setCategorie] = useState("");
  const [montant, setMontant] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  function load() {
    fetchDepenses().then((res) => setDepenses(res.data));
  }

  useEffect(() => {
    load();
  }, []);

  async function handleSubmit() {
    if (!categorie || !montant) return;
    setIsSubmitting(true);
    try {
      await createDepense({
        categorie,
        montant: Number(montant),
        description: description || undefined,
      });
      setCategorie("");
      setMontant("");
      setDescription("");
      load();
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex flex-col gap-4 max-w-lg">
      <Card className="flex flex-col gap-3">
        <div className="flex gap-2">
          <div className="flex-1">
            <Field label="Catégorie">
              <Input
                placeholder="Catégorie"
                value={categorie}
                onChange={(e) => setCategorie(e.target.value)}
              />
            </Field>
          </div>
          <div className="w-32">
            <Field label="Montant">
              <Input
                placeholder="Montant"
                value={montant}
                onChange={(e) => setMontant(e.target.value)}
              />
            </Field>
          </div>
        </div>
        <Field label="Description">
          <Input
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </Field>
        <Button onClick={handleSubmit} disabled={isSubmitting} className="self-start">
          Enregistrer la dépense
        </Button>
      </Card>

      <ul className="flex flex-col gap-2 text-sm">
        {depenses.map((d) => (
          <li
            key={d.id}
            className="flex items-center justify-between rounded-xl border border-border bg-surface p-3"
          >
            <span>
              {d.categorie}
              {d.description && ` - ${d.description}`}
            </span>
            <span className="font-semibold">{d.montant} F CFA</span>
          </li>
        ))}
        {depenses.length === 0 && <li className="text-muted">Aucune dépense.</li>}
      </ul>
    </div>
  );
}
