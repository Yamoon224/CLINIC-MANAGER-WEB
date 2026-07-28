"use client";

import { useCallback, useEffect, useState } from "react";
import {
  ajouterActe,
  enregistrerConstantes,
  getAdmission,
  mettreEnObservation,
  sortir,
  trier,
} from "./urgences-api";
import {
  ISSUE_LABELS,
  NIVEAUX_TRIAGE,
  NIVEAU_TRIAGE_COLORS,
  NIVEAU_TRIAGE_LABELS,
  type AdmissionUrgence,
  type IssueUrgence,
} from "./types";

export function UrgenceDetail({ id }: { id: number }) {
  const [admission, setAdmission] = useState<AdmissionUrgence | null>(null);
  const [acteDescription, setActeDescription] = useState("");
  const [constantes, setConstantes] = useState({
    temperature: "",
    tension: "",
    poids: "",
    pouls: "",
  });
  const [issue, setIssue] = useState<IssueUrgence>("domicile");
  const [busy, setBusy] = useState(false);

  const load = useCallback(() => {
    getAdmission(id).then((res) => {
      setAdmission(res.data);
      setConstantes({
        temperature: res.data.constantes.temperature ?? "",
        tension: res.data.constantes.tension ?? "",
        poids: res.data.constantes.poids ?? "",
        pouls: res.data.constantes.pouls?.toString() ?? "",
      });
    });
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleTrier(niveau: (typeof NIVEAUX_TRIAGE)[number]) {
    setBusy(true);
    try {
      await trier(id, niveau);
      load();
    } finally {
      setBusy(false);
    }
  }

  async function handleSaveConstantes() {
    setBusy(true);
    try {
      await enregistrerConstantes(id, {
        temperature: constantes.temperature ? Number(constantes.temperature) : undefined,
        tension: constantes.tension || undefined,
        poids: constantes.poids ? Number(constantes.poids) : undefined,
        pouls: constantes.pouls ? Number(constantes.pouls) : undefined,
      });
      load();
    } finally {
      setBusy(false);
    }
  }

  async function handleAddActe() {
    if (!acteDescription.trim()) return;
    setBusy(true);
    try {
      await ajouterActe(id, acteDescription);
      setActeDescription("");
      load();
    } finally {
      setBusy(false);
    }
  }

  async function handleObservation() {
    setBusy(true);
    try {
      await mettreEnObservation(id);
      load();
    } finally {
      setBusy(false);
    }
  }

  async function handleSortie() {
    setBusy(true);
    try {
      await sortir(id, issue);
      load();
    } finally {
      setBusy(false);
    }
  }

  if (!admission) return <p className="text-gray-500">Chargement...</p>;

  const readOnly = admission.statut === "sorti";

  return (
    <div className="flex flex-col gap-4 max-w-2xl">
      <div>
        <h1 className="text-lg font-semibold">
          Urgences — {admission.patient.prenom} {admission.patient.nom}
        </h1>
        <p className="text-sm text-gray-500">
          Dossier n° {admission.patient.numero_dossier} · Statut : {admission.statut}
        </p>
      </div>

      {admission.patient.allergies && (
        <div className="border border-red-300 bg-red-50 rounded p-3 text-sm">
          <span className="font-semibold text-red-700">⚠ Allergies : </span>
          {admission.patient.allergies}
        </div>
      )}

      {readOnly && (
        <div className="border border-green-300 bg-green-50 rounded p-3 text-sm text-green-800">
          Sortie enregistrée : {admission.issue && ISSUE_LABELS[admission.issue]}
        </div>
      )}

      <div>
        <h2 className="font-semibold mb-2">Triage</h2>
        <div className="flex flex-wrap gap-2">
          {NIVEAUX_TRIAGE.map((niveau) => (
            <button
              key={niveau}
              disabled={busy || readOnly}
              onClick={() => handleTrier(niveau)}
              className={`px-3 py-2 rounded text-sm font-semibold disabled:opacity-50 ${
                admission.niveau_triage === niveau
                  ? NIVEAU_TRIAGE_COLORS[niveau]
                  : "border"
              }`}
            >
              {NIVEAU_TRIAGE_LABELS[niveau]}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h2 className="font-semibold mb-2">Constantes</h2>
        <div className="grid grid-cols-4 gap-3">
          <input
            placeholder="Température"
            disabled={readOnly}
            value={constantes.temperature}
            onChange={(e) => setConstantes((c) => ({ ...c, temperature: e.target.value }))}
            className="border rounded px-3 py-2 disabled:bg-gray-100"
          />
          <input
            placeholder="Tension"
            disabled={readOnly}
            value={constantes.tension}
            onChange={(e) => setConstantes((c) => ({ ...c, tension: e.target.value }))}
            className="border rounded px-3 py-2 disabled:bg-gray-100"
          />
          <input
            placeholder="Poids"
            disabled={readOnly}
            value={constantes.poids}
            onChange={(e) => setConstantes((c) => ({ ...c, poids: e.target.value }))}
            className="border rounded px-3 py-2 disabled:bg-gray-100"
          />
          <input
            placeholder="Pouls"
            disabled={readOnly}
            value={constantes.pouls}
            onChange={(e) => setConstantes((c) => ({ ...c, pouls: e.target.value }))}
            className="border rounded px-3 py-2 disabled:bg-gray-100"
          />
        </div>
        {!readOnly && (
          <button
            onClick={handleSaveConstantes}
            disabled={busy}
            className="border rounded px-3 py-2 mt-2 disabled:opacity-50"
          >
            Enregistrer les constantes
          </button>
        )}
      </div>

      <div>
        <h2 className="font-semibold mb-2">Gestes et traitements (traçabilité)</h2>
        <ul className="flex flex-col gap-1 mb-2 text-sm">
          {admission.actes.map((acte) => (
            <li key={acte.id} className="border rounded p-2">
              <span className="text-gray-500">
                {acte.created_at &&
                  new Date(acte.created_at).toLocaleTimeString("fr-FR", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
              </span>{" "}
              — {acte.description}
            </li>
          ))}
          {admission.actes.length === 0 && (
            <li className="text-gray-500">Aucun acte enregistré.</li>
          )}
        </ul>
        {!readOnly && (
          <div className="flex gap-2">
            <input
              placeholder="Ex. pose de voie veineuse, administration de..."
              value={acteDescription}
              onChange={(e) => setActeDescription(e.target.value)}
              className="border rounded px-3 py-2 flex-1"
            />
            <button
              onClick={handleAddActe}
              disabled={busy}
              className="border rounded px-3 py-2 disabled:opacity-50"
            >
              Ajouter
            </button>
          </div>
        )}
      </div>

      {!readOnly && (
        <div className="flex items-center gap-4 border-t pt-4">
          {admission.statut !== "observation" && (
            <button
              onClick={handleObservation}
              disabled={busy}
              className="border rounded px-3 py-2 disabled:opacity-50"
            >
              Mettre en observation
            </button>
          )}

          <select
            value={issue}
            onChange={(e) => setIssue(e.target.value as IssueUrgence)}
            className="border rounded px-3 py-2"
          >
            {Object.entries(ISSUE_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
          <button
            onClick={handleSortie}
            disabled={busy}
            className="bg-blue-600 text-white rounded px-3 py-2 disabled:opacity-50"
          >
            Enregistrer la sortie
          </button>
        </div>
      )}
    </div>
  );
}
