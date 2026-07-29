"use client";

import { useEffect, useState } from "react";
import { demanderConge, fetchConges, fetchEmployes, traiterConge } from "./personnel-api";
import {
  CONGE_STATUT_LABELS,
  CONGE_TYPE_LABELS,
  type Conge,
  type CongeStatut,
  type CongeType,
  type Employe,
} from "./types";

export function Conges() {
  const [statut, setStatut] = useState<CongeStatut | "">("en_attente");
  const [conges, setConges] = useState<Conge[]>([]);
  const [employes, setEmployes] = useState<Employe[]>([]);
  const [employeId, setEmployeId] = useState("");
  const [type, setType] = useState<CongeType>("annuel");
  const [dateDebut, setDateDebut] = useState("");
  const [dateFin, setDateFin] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);

  function load() {
    fetchConges(statut).then((res) => setConges(res.data));
  }

  useEffect(() => {
    fetchConges(statut).then((res) => setConges(res.data));
  }, [statut]);

  useEffect(() => {
    fetchEmployes().then((res) => setEmployes(res.data));
  }, []);

  async function handleDemander() {
    if (!employeId || !dateDebut || !dateFin) return;
    setError(null);
    try {
      await demanderConge(Number(employeId), { type, date_debut: dateDebut, date_fin: dateFin });
      setDateDebut("");
      setDateFin("");
      load();
    } catch {
      setError("Demande impossible (période déjà couverte par un congé existant ?).");
    }
  }

  async function handleTraiter(id: number, decision: "approuve" | "refuse") {
    setBusyId(id);
    try {
      await traiterConge(id, decision);
      load();
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="flex flex-col gap-4 max-w-2xl">
      <div className="border rounded p-3 flex flex-col gap-2">
        <div className="flex gap-2">
          <select
            value={employeId}
            onChange={(e) => setEmployeId(e.target.value)}
            className="border rounded px-3 py-2 flex-1"
          >
            <option value="">Employé…</option>
            {employes.map((e) => (
              <option key={e.id} value={e.id}>
                {e.prenom} {e.nom}
              </option>
            ))}
          </select>
          <select
            value={type}
            onChange={(e) => setType(e.target.value as CongeType)}
            className="border rounded px-3 py-2"
          >
            {Object.entries(CONGE_TYPE_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
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
            className="border rounded px-3 py-2 flex-1"
          />
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          onClick={handleDemander}
          className="border rounded px-3 py-2 self-start"
        >
          Demander un congé
        </button>
      </div>

      <select
        value={statut}
        onChange={(e) => setStatut(e.target.value as CongeStatut | "")}
        className="border rounded px-3 py-2 w-56"
      >
        <option value="">Tous statuts</option>
        {Object.entries(CONGE_STATUT_LABELS).map(([value, label]) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </select>

      <ul className="flex flex-col gap-2 text-sm">
        {conges.map((c) => (
          <li key={c.id} className="border rounded p-2">
            <div className="flex items-center justify-between">
              <span className="font-medium">
                {c.employe && `${c.employe.prenom} ${c.employe.nom}`} — {CONGE_TYPE_LABELS[c.type]}
              </span>
              <span className="text-xs text-gray-500">{CONGE_STATUT_LABELS[c.statut]}</span>
            </div>
            <div className="text-xs text-gray-600">
              Du {c.date_debut} au {c.date_fin} ({c.duree_jours} j.)
            </div>
            {c.statut === "en_attente" && (
              <div className="flex gap-2 mt-2">
                <button
                  onClick={() => handleTraiter(c.id, "approuve")}
                  disabled={busyId === c.id}
                  className="border rounded px-2 py-1 text-xs text-green-700 disabled:opacity-50"
                >
                  Approuver
                </button>
                <button
                  onClick={() => handleTraiter(c.id, "refuse")}
                  disabled={busyId === c.id}
                  className="border rounded px-2 py-1 text-xs text-red-700 disabled:opacity-50"
                >
                  Refuser
                </button>
              </div>
            )}
          </li>
        ))}
        {conges.length === 0 && <li className="text-gray-500">Aucun congé.</li>}
      </ul>
    </div>
  );
}
