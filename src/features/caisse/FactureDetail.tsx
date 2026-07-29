"use client";

import { useCallback, useEffect, useState } from "react";
import { annulerFacture, encaisser, fetchFacture } from "./caisse-api";
import { MODE_PAIEMENT_LABELS, type Facture, type ModePaiement } from "./types";

export function FactureDetail({ id }: { id: number }) {
  const [facture, setFacture] = useState<Facture | null>(null);
  const [montant, setMontant] = useState("");
  const [modePaiement, setModePaiement] = useState<ModePaiement>("especes");
  const [reference, setReference] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    fetchFacture(id).then((res) => setFacture(res.data));
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleEncaisser() {
    if (!montant) return;
    setBusy(true);
    setError(null);
    try {
      await encaisser(id, {
        montant: Number(montant),
        mode_paiement: modePaiement,
        reference: reference || undefined,
      });
      setMontant("");
      setReference("");
      load();
    } catch {
      setError("Encaissement impossible (session de caisse ouverte requise, montant valide).");
    } finally {
      setBusy(false);
    }
  }

  async function handleAnnuler() {
    setBusy(true);
    try {
      await annulerFacture(id);
      load();
    } finally {
      setBusy(false);
    }
  }

  if (!facture) return <p className="text-gray-500">Chargement...</p>;

  const active = facture.statut === "ouverte" || facture.statut === "partiellement_payee";

  return (
    <div className="flex flex-col gap-4 max-w-2xl">
      <div>
        <h1 className="text-lg font-semibold">
          Facture #{facture.id} — {facture.patient.prenom} {facture.patient.nom}
        </h1>
        <p className="text-sm text-gray-500">Dossier n° {facture.patient.numero_dossier}</p>
      </div>

      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="text-left border-b">
            <th className="py-2 pr-4">Désignation</th>
            <th className="py-2 pr-4">Qté</th>
            <th className="py-2 pr-4">P.U.</th>
            <th className="py-2 pr-4">Montant</th>
          </tr>
        </thead>
        <tbody>
          {facture.lignes.map((l) => (
            <tr key={l.id} className="border-b">
              <td className="py-2 pr-4">{l.designation}</td>
              <td className="py-2 pr-4">{l.quantite}</td>
              <td className="py-2 pr-4">{l.prix_unitaire}</td>
              <td className="py-2 pr-4">{l.montant}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="flex justify-between text-sm max-w-xs">
        <span>Total</span>
        <span className="font-semibold">{facture.montant_total} F CFA</span>
      </div>
      <div className="flex justify-between text-sm max-w-xs">
        <span>Payé</span>
        <span>{facture.montant_paye} F CFA</span>
      </div>
      <div className="flex justify-between text-sm max-w-xs">
        <span>Solde</span>
        <span className="font-semibold">{facture.solde} F CFA</span>
      </div>

      <div>
        <h2 className="font-semibold mb-2">Encaissements</h2>
        <ul className="text-sm flex flex-col gap-1 mb-2">
          {facture.encaissements.map((e) => (
            <li key={e.id} className="border rounded p-2">
              {e.montant} F CFA — {MODE_PAIEMENT_LABELS[e.mode_paiement]}
              {e.caissier && ` (${e.caissier.name})`}
            </li>
          ))}
          {facture.encaissements.length === 0 && (
            <li className="text-gray-500">Aucun encaissement.</li>
          )}
        </ul>

        {active && (
          <div className="border rounded p-3 flex items-center gap-2">
            <input
              placeholder="Montant"
              value={montant}
              onChange={(e) => setMontant(e.target.value)}
              className="border rounded px-3 py-2 w-32"
            />
            <select
              value={modePaiement}
              onChange={(e) => setModePaiement(e.target.value as ModePaiement)}
              className="border rounded px-3 py-2"
            >
              {Object.entries(MODE_PAIEMENT_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
            <input
              placeholder="Référence"
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              className="border rounded px-3 py-2 flex-1"
            />
            <button
              onClick={handleEncaisser}
              disabled={busy}
              className="bg-blue-600 text-white rounded px-3 py-2 disabled:opacity-50"
            >
              Encaisser
            </button>
          </div>
        )}
        {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
      </div>

      {facture.statut === "ouverte" && (
        <button
          onClick={handleAnnuler}
          disabled={busy}
          className="underline text-red-600 self-start disabled:opacity-50"
        >
          Annuler la facture
        </button>
      )}
    </div>
  );
}
