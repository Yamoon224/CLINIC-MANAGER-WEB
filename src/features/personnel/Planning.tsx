"use client";

import { useEffect, useState } from "react";
import { assignerPlanning, fetchEmployes, fetchPlanning, retirerPlanning } from "./personnel-api";
import { CRENEAU_LABELS, type Creneau, type Employe, type Planning as PlanningEntry } from "./types";

export function Planning() {
  const [entries, setEntries] = useState<PlanningEntry[]>([]);
  const [employes, setEmployes] = useState<Employe[]>([]);
  const [employeId, setEmployeId] = useState("");
  const [date, setDate] = useState("");
  const [creneau, setCreneau] = useState<Creneau>("matin");
  const [service, setService] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  function load() {
    fetchPlanning().then((res) => setEntries(res.data));
  }

  useEffect(() => {
    load();
    fetchEmployes().then((res) => setEmployes(res.data));
  }, []);

  async function handleAssigner() {
    if (!employeId || !date) return;
    setBusy(true);
    setError(null);
    try {
      await assignerPlanning(Number(employeId), { date, creneau, service: service || undefined });
      setDate("");
      setService("");
      load();
    } catch {
      setError("Affectation impossible (créneau déjà pris ou employé en congé).");
    } finally {
      setBusy(false);
    }
  }

  async function handleRetirer(id: number) {
    setBusy(true);
    try {
      await retirerPlanning(id);
      load();
    } finally {
      setBusy(false);
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
            value={creneau}
            onChange={(e) => setCreneau(e.target.value as Creneau)}
            className="border rounded px-3 py-2"
          >
            {Object.entries(CRENEAU_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
        <div className="flex gap-2">
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="border rounded px-3 py-2 flex-1"
          />
          <input
            placeholder="Service (optionnel)"
            value={service}
            onChange={(e) => setService(e.target.value)}
            className="border rounded px-3 py-2 flex-1"
          />
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          onClick={handleAssigner}
          disabled={busy}
          className="border rounded px-3 py-2 self-start disabled:opacity-50"
        >
          Affecter au planning
        </button>
      </div>

      <ul className="flex flex-col gap-1 text-sm">
        {entries.map((p) => (
          <li key={p.id} className="border rounded p-2 flex items-center justify-between">
            <span>
              {p.date} - {CRENEAU_LABELS[p.creneau]}
              {p.employe && ` - ${p.employe.prenom} ${p.employe.nom}`}
              {p.service && ` (${p.service})`}
            </span>
            <button
              onClick={() => handleRetirer(p.id)}
              disabled={busy}
              className="text-xs underline text-red-600 disabled:opacity-50"
            >
              Retirer
            </button>
          </li>
        ))}
        {entries.length === 0 && <li className="text-gray-500">Aucune affectation.</li>}
      </ul>
    </div>
  );
}
