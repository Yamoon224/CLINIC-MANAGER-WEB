"use client";

import { useEffect, useState } from "react";
import { createDepense, fetchDepenses } from "./caisse-api";
import type { Depense } from "./types";

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
      <div className="border rounded p-3 flex flex-col gap-2">
        <div className="flex gap-2">
          <input
            placeholder="Catégorie"
            value={categorie}
            onChange={(e) => setCategorie(e.target.value)}
            className="border rounded px-3 py-2 flex-1"
          />
          <input
            placeholder="Montant"
            value={montant}
            onChange={(e) => setMontant(e.target.value)}
            className="border rounded px-3 py-2 w-32"
          />
        </div>
        <input
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="border rounded px-3 py-2"
        />
        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="border rounded px-3 py-2 self-start disabled:opacity-50"
        >
          Enregistrer la dépense
        </button>
      </div>

      <ul className="flex flex-col gap-1 text-sm">
        {depenses.map((d) => (
          <li key={d.id} className="border rounded p-2 flex justify-between">
            <span>
              {d.categorie}
              {d.description && ` — ${d.description}`}
            </span>
            <span className="font-medium">{d.montant} F CFA</span>
          </li>
        ))}
        {depenses.length === 0 && <li className="text-gray-500">Aucune dépense.</li>}
      </ul>
    </div>
  );
}
