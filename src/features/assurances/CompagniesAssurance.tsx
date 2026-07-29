"use client";

import { useEffect, useState } from "react";
import { createCompagnie, fetchCompagnies } from "./assurances-api";
import type { CompagnieAssurance } from "./types";

export function CompagniesAssurance() {
  const [compagnies, setCompagnies] = useState<CompagnieAssurance[]>([]);
  const [nom, setNom] = useState("");
  const [taux, setTaux] = useState("");
  const [contactTelephone, setContactTelephone] = useState("");
  const [busy, setBusy] = useState(false);

  function load() {
    fetchCompagnies().then((res) => setCompagnies(res.data));
  }

  useEffect(() => {
    load();
  }, []);

  async function handleSubmit() {
    if (!nom || !taux) return;
    setBusy(true);
    try {
      await createCompagnie({
        nom,
        taux_couverture_defaut: Number(taux),
        contact_telephone: contactTelephone || undefined,
      });
      setNom("");
      setTaux("");
      setContactTelephone("");
      load();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col gap-4 max-w-lg">
      <div className="border rounded p-3 flex flex-col gap-2">
        <div className="flex gap-2">
          <input
            placeholder="Nom de la compagnie"
            value={nom}
            onChange={(e) => setNom(e.target.value)}
            className="border rounded px-3 py-2 flex-1"
          />
          <input
            placeholder="Taux couverture % défaut"
            value={taux}
            onChange={(e) => setTaux(e.target.value)}
            className="border rounded px-3 py-2 w-40"
          />
        </div>
        <input
          placeholder="Téléphone contact"
          value={contactTelephone}
          onChange={(e) => setContactTelephone(e.target.value)}
          className="border rounded px-3 py-2"
        />
        <button
          onClick={handleSubmit}
          disabled={busy}
          className="border rounded px-3 py-2 self-start disabled:opacity-50"
        >
          Ajouter la compagnie
        </button>
      </div>

      <ul className="flex flex-col gap-1 text-sm">
        {compagnies.map((c) => (
          <li key={c.id} className="border rounded p-2 flex justify-between">
            <span>
              {c.nom}
              {c.contact_telephone && ` - ${c.contact_telephone}`}
            </span>
            <span className="font-medium">{c.taux_couverture_defaut}%</span>
          </li>
        ))}
        {compagnies.length === 0 && <li className="text-gray-500">Aucune compagnie.</li>}
      </ul>
    </div>
  );
}
