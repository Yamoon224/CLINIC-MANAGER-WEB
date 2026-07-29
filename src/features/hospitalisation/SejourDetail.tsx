"use client";

import { useCallback, useEffect, useState } from "react";
import {
  ajouterSuivi,
  fetchLits,
  fetchSejour,
  sortir,
  transferer,
} from "./hospitalisation-api";
import type { Lit, Sejour } from "./types";

export function SejourDetail({ id }: { id: number }) {
  const [sejour, setSejour] = useState<Sejour | null>(null);
  const [litsLibres, setLitsLibres] = useState<Lit[]>([]);
  const [nouveauLitId, setNouveauLitId] = useState<number | "">("");

  const [temperature, setTemperature] = useState("");
  const [tension, setTension] = useState("");
  const [pouls, setPouls] = useState("");
  const [observations, setObservations] = useState("");
  const [busy, setBusy] = useState(false);

  const load = useCallback(() => {
    fetchSejour(id).then((res) => setSejour(res.data));
    fetchLits().then((res) => setLitsLibres(res.data.filter((l) => l.statut === "libre")));
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleAjouterSuivi() {
    setBusy(true);
    try {
      await ajouterSuivi(id, {
        releve_at: new Date().toISOString(),
        temperature: temperature ? Number(temperature) : undefined,
        tension: tension || undefined,
        pouls: pouls ? Number(pouls) : undefined,
        observations: observations || undefined,
      });
      setTemperature("");
      setTension("");
      setPouls("");
      setObservations("");
      load();
    } finally {
      setBusy(false);
    }
  }

  async function handleTransferer() {
    if (!nouveauLitId) return;
    setBusy(true);
    try {
      await transferer(id, nouveauLitId);
      setNouveauLitId("");
      load();
    } finally {
      setBusy(false);
    }
  }

  async function handleSortir() {
    setBusy(true);
    try {
      await sortir(id);
      load();
    } finally {
      setBusy(false);
    }
  }

  if (!sejour) return <p className="text-gray-500">Chargement...</p>;

  const readOnly = sejour.statut === "termine";

  return (
    <div className="flex flex-col gap-4 max-w-2xl">
      <div>
        <h1 className="text-lg font-semibold">
          Hospitalisation — {sejour.patient.prenom} {sejour.patient.nom}
        </h1>
        <p className="text-sm text-gray-500">
          Chambre {sejour.lit.chambre} — {sejour.lit.numero} · {sejour.motif}
        </p>
      </div>

      {readOnly && (
        <div className="border border-green-300 bg-green-50 rounded p-3 text-sm text-green-800">
          Sortie enregistrée — {sejour.nombre_jours} jour(s), frais de séjour :{" "}
          {sejour.frais_sejour} F CFA
        </div>
      )}

      <div>
        <h2 className="font-semibold mb-2">Feuille de température</h2>
        <ul className="flex flex-col gap-1 mb-2 text-sm">
          {sejour.suivis.map((s) => (
            <li key={s.id} className="border rounded p-2">
              <span className="text-gray-500">
                {s.releve_at && new Date(s.releve_at).toLocaleString("fr-FR")}
              </span>{" "}
              {s.temperature && `${s.temperature}°C `}
              {s.pouls && `· ${s.pouls} bpm `}
              {s.observations && <p>{s.observations}</p>}
            </li>
          ))}
          {sejour.suivis.length === 0 && (
            <li className="text-gray-500">Aucun relevé enregistré.</li>
          )}
        </ul>

        {!readOnly && (
          <div className="border rounded p-3 flex flex-col gap-2">
            <div className="grid grid-cols-3 gap-2">
              <input
                placeholder="Température"
                value={temperature}
                onChange={(e) => setTemperature(e.target.value)}
                className="border rounded px-3 py-2"
              />
              <input
                placeholder="Tension"
                value={tension}
                onChange={(e) => setTension(e.target.value)}
                className="border rounded px-3 py-2"
              />
              <input
                placeholder="Pouls"
                value={pouls}
                onChange={(e) => setPouls(e.target.value)}
                className="border rounded px-3 py-2"
              />
            </div>
            <textarea
              placeholder="Soins administrés, observations..."
              value={observations}
              onChange={(e) => setObservations(e.target.value)}
              className="border rounded px-3 py-2"
              rows={2}
            />
            <button
              onClick={handleAjouterSuivi}
              disabled={busy}
              className="border rounded px-3 py-2 self-start disabled:opacity-50"
            >
              Ajouter le relevé
            </button>
          </div>
        )}
      </div>

      {!readOnly && (
        <div className="flex items-center gap-4 border-t pt-4">
          <select
            value={nouveauLitId}
            onChange={(e) => setNouveauLitId(e.target.value ? Number(e.target.value) : "")}
            className="border rounded px-3 py-2"
          >
            <option value="">Transférer vers...</option>
            {litsLibres.map((l) => (
              <option key={l.id} value={l.id}>
                Chambre {l.chambre} — {l.numero}
              </option>
            ))}
          </select>
          <button
            onClick={handleTransferer}
            disabled={busy || !nouveauLitId}
            className="border rounded px-3 py-2 disabled:opacity-50"
          >
            Transférer
          </button>

          <button
            onClick={handleSortir}
            disabled={busy}
            className="bg-blue-600 text-white rounded px-3 py-2 disabled:opacity-50 ml-auto"
          >
            Enregistrer la sortie
          </button>
        </div>
      )}
    </div>
  );
}
