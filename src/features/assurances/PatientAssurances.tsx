"use client";

import { useCallback, useEffect, useState } from "react";
import {
  createAssurancePatient,
  demanderPriseEnCharge,
  fetchAssurancesPatient,
  fetchCompagnies,
} from "./assurances-api";
import type { AssurancePatient, CompagnieAssurance } from "./types";

export function PatientAssurances({ patientId }: { patientId: number }) {
  const [assurances, setAssurances] = useState<AssurancePatient[] | null>(null);
  const [compagnies, setCompagnies] = useState<CompagnieAssurance[]>([]);
  const [compagnieId, setCompagnieId] = useState("");
  const [numeroAdherent, setNumeroAdherent] = useState("");
  const [dateDebut, setDateDebut] = useState("");
  const [dateFin, setDateFin] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    fetchAssurancesPatient(patientId).then((res) => setAssurances(res.data));
  }, [patientId]);

  useEffect(() => {
    load();
    fetchCompagnies().then((res) => setCompagnies(res.data));
  }, [load, patientId]);

  async function handleSubmit() {
    if (!compagnieId || !numeroAdherent || !dateDebut) return;
    setBusy(true);
    setError(null);
    try {
      await createAssurancePatient(patientId, {
        compagnie_assurance_id: Number(compagnieId),
        numero_adherent: numeroAdherent,
        date_debut: dateDebut,
        date_fin: dateFin || undefined,
      });
      setCompagnieId("");
      setNumeroAdherent("");
      setDateDebut("");
      setDateFin("");
      load();
    } catch {
      setError("Impossible d'enregistrer cette couverture.");
    } finally {
      setBusy(false);
    }
  }

  if (assurances === null) return null;

  return (
    <div>
      <h2 className="font-semibold mb-2">Assurances / tiers payant</h2>
      <ul className="flex flex-col gap-2 mb-3 text-sm">
        {assurances.map((a) => (
          <AssuranceRow key={a.id} assurance={a} onChanged={load} />
        ))}
        {assurances.length === 0 && (
          <li className="text-gray-500">Aucune couverture enregistrée.</li>
        )}
      </ul>

      <div className="border rounded p-3 flex flex-col gap-2 max-w-lg">
        <span className="text-sm font-medium">Ajouter une couverture</span>
        <div className="flex gap-2">
          <select
            value={compagnieId}
            onChange={(e) => setCompagnieId(e.target.value)}
            className="border rounded px-3 py-2 flex-1"
          >
            <option value="">Compagnie…</option>
            {compagnies.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nom} ({c.taux_couverture_defaut}%)
              </option>
            ))}
          </select>
          <input
            placeholder="N° adhérent"
            value={numeroAdherent}
            onChange={(e) => setNumeroAdherent(e.target.value)}
            className="border rounded px-3 py-2 w-40"
          />
        </div>
        <div className="flex gap-2">
          <input
            type="date"
            value={dateDebut}
            onChange={(e) => setDateDebut(e.target.value)}
            className="border rounded px-3 py-2 flex-1"
          />
          <input
            type="date"
            value={dateFin}
            onChange={(e) => setDateFin(e.target.value)}
            placeholder="Date de fin (optionnel)"
            className="border rounded px-3 py-2 flex-1"
          />
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          onClick={handleSubmit}
          disabled={busy}
          className="border rounded px-3 py-2 self-start disabled:opacity-50"
        >
          Enregistrer
        </button>
      </div>
    </div>
  );
}

function AssuranceRow({
  assurance,
  onChanged,
}: {
  assurance: AssurancePatient;
  onChanged: () => void;
}) {
  const [showForm, setShowForm] = useState(false);
  const [motif, setMotif] = useState("");
  const [plafond, setPlafond] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleDemander() {
    if (!motif) return;
    setBusy(true);
    try {
      await demanderPriseEnCharge(assurance.id, {
        motif,
        montant_plafond: plafond ? Number(plafond) : undefined,
      });
      setMotif("");
      setPlafond("");
      setShowForm(false);
      onChanged();
    } finally {
      setBusy(false);
    }
  }

  return (
    <li className="border rounded p-2">
      <div className="flex items-center justify-between">
        <span>
          {assurance.compagnie.nom} — {assurance.numero_adherent} ({assurance.taux_couverture}%)
        </span>
        <span
          className={
            assurance.active
              ? "text-green-700 text-xs font-medium"
              : "text-gray-500 text-xs font-medium"
          }
        >
          {assurance.active ? "Active" : assurance.statut}
        </span>
      </div>
      <div className="text-xs text-gray-500">
        Du {assurance.date_debut} {assurance.date_fin ? `au ${assurance.date_fin}` : "(sans échéance)"}
      </div>

      {!showForm ? (
        <button
          onClick={() => setShowForm(true)}
          className="text-xs underline text-blue-600 mt-1"
        >
          Demander une prise en charge
        </button>
      ) : (
        <div className="flex gap-2 mt-2">
          <input
            placeholder="Motif"
            value={motif}
            onChange={(e) => setMotif(e.target.value)}
            className="border rounded px-2 py-1 flex-1 text-xs"
          />
          <input
            placeholder="Plafond (optionnel)"
            value={plafond}
            onChange={(e) => setPlafond(e.target.value)}
            className="border rounded px-2 py-1 w-28 text-xs"
          />
          <button
            onClick={handleDemander}
            disabled={busy}
            className="border rounded px-2 py-1 text-xs disabled:opacity-50"
          >
            Envoyer
          </button>
        </div>
      )}
    </li>
  );
}
