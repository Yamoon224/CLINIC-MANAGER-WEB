"use client";

import { useState } from "react";
import { addNouveauNe } from "./maternite-api";

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
    <form onSubmit={handleSubmit} className="border rounded p-3 flex flex-col gap-2 max-w-lg">
      <div className="grid grid-cols-3 gap-2">
        <select
          value={sexe}
          onChange={(e) => setSexe(e.target.value as "M" | "F" | "")}
          className="border rounded px-3 py-2"
        >
          <option value="">Sexe</option>
          <option value="F">Féminin</option>
          <option value="M">Masculin</option>
        </select>
        <input
          placeholder="Poids (kg)"
          value={poids}
          onChange={(e) => setPoids(e.target.value)}
          className="border rounded px-3 py-2"
        />
        <input
          placeholder="Taille (cm)"
          value={taille}
          onChange={(e) => setTaille(e.target.value)}
          className="border rounded px-3 py-2"
        />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <input
          placeholder="Score Apgar 1 min"
          value={apgar1}
          onChange={(e) => setApgar1(e.target.value)}
          className="border rounded px-3 py-2"
        />
        <input
          placeholder="Score Apgar 5 min"
          value={apgar5}
          onChange={(e) => setApgar5(e.target.value)}
          className="border rounded px-3 py-2"
        />
      </div>
      <input
        placeholder="Vaccinations de naissance"
        value={vaccinations}
        onChange={(e) => setVaccinations(e.target.value)}
        className="border rounded px-3 py-2"
      />
      <button
        type="submit"
        disabled={isSubmitting}
        className="border rounded px-3 py-2 self-start disabled:opacity-50"
      >
        Ajouter le nouveau-né
      </button>
    </form>
  );
}
