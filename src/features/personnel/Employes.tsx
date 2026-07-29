"use client";

import { useEffect, useState } from "react";
import { createEmploye, fetchEmployes } from "./personnel-api";
import { TYPE_CONTRAT_LABELS, type Employe, type TypeContrat } from "./types";

export function Employes() {
  const [employes, setEmployes] = useState<Employe[]>([]);
  const [nom, setNom] = useState("");
  const [prenom, setPrenom] = useState("");
  const [fonction, setFonction] = useState("");
  const [service, setService] = useState("");
  const [typeContrat, setTypeContrat] = useState<TypeContrat>("cdi");
  const [dateEmbauche, setDateEmbauche] = useState("");
  const [busy, setBusy] = useState(false);

  function load() {
    fetchEmployes().then((res) => setEmployes(res.data));
  }

  useEffect(() => {
    load();
  }, []);

  async function handleSubmit() {
    if (!nom || !prenom || !fonction || !dateEmbauche) return;
    setBusy(true);
    try {
      await createEmploye({
        nom,
        prenom,
        fonction,
        service: service || undefined,
        type_contrat: typeContrat,
        date_embauche: dateEmbauche,
      });
      setNom("");
      setPrenom("");
      setFonction("");
      setService("");
      setDateEmbauche("");
      load();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col gap-4 max-w-2xl">
      <div className="border rounded p-3 flex flex-col gap-2">
        <div className="flex gap-2">
          <input
            placeholder="Nom"
            value={nom}
            onChange={(e) => setNom(e.target.value)}
            className="border rounded px-3 py-2 flex-1"
          />
          <input
            placeholder="Prénom"
            value={prenom}
            onChange={(e) => setPrenom(e.target.value)}
            className="border rounded px-3 py-2 flex-1"
          />
        </div>
        <div className="flex gap-2">
          <input
            placeholder="Fonction"
            value={fonction}
            onChange={(e) => setFonction(e.target.value)}
            className="border rounded px-3 py-2 flex-1"
          />
          <input
            placeholder="Service"
            value={service}
            onChange={(e) => setService(e.target.value)}
            className="border rounded px-3 py-2 flex-1"
          />
        </div>
        <div className="flex gap-2">
          <select
            value={typeContrat}
            onChange={(e) => setTypeContrat(e.target.value as TypeContrat)}
            className="border rounded px-3 py-2 flex-1"
          >
            {Object.entries(TYPE_CONTRAT_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
          <input
            type="date"
            value={dateEmbauche}
            onChange={(e) => setDateEmbauche(e.target.value)}
            className="border rounded px-3 py-2 flex-1"
          />
        </div>
        <button
          onClick={handleSubmit}
          disabled={busy}
          className="border rounded px-3 py-2 self-start disabled:opacity-50"
        >
          Ajouter l&apos;employé
        </button>
      </div>

      <ul className="flex flex-col gap-1 text-sm">
        {employes.map((e) => (
          <li key={e.id} className="border rounded p-2 flex justify-between">
            <span>
              {e.prenom} {e.nom} - {e.fonction}
              {e.service && ` (${e.service})`}
            </span>
            <span className="text-gray-500 text-xs">
              {e.matricule} - {TYPE_CONTRAT_LABELS[e.type_contrat]}
            </span>
          </li>
        ))}
        {employes.length === 0 && <li className="text-gray-500">Aucun employé.</li>}
      </ul>
    </div>
  );
}
