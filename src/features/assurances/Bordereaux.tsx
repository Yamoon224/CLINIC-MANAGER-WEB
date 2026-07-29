"use client";

import { useEffect, useState } from "react";
import {
  creerBordereau,
  envoyerBordereau,
  fetchBordereaux,
  fetchCompagnies,
  reglerBordereau,
} from "./assurances-api";
import type { BordereauAssurance, CompagnieAssurance } from "./types";

const STATUT_LABELS: Record<BordereauAssurance["statut"], string> = {
  brouillon: "Brouillon",
  envoye: "Envoyé",
  paye_partiel: "Payé partiellement",
  paye: "Payé",
};

export function Bordereaux() {
  const [bordereaux, setBordereaux] = useState<BordereauAssurance[]>([]);
  const [compagnies, setCompagnies] = useState<CompagnieAssurance[]>([]);
  const [compagnieId, setCompagnieId] = useState("");
  const [montantRegle, setMontantRegle] = useState<Record<number, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  function load() {
    fetchBordereaux().then((res) => setBordereaux(res.data));
  }

  useEffect(() => {
    load();
    fetchCompagnies().then((res) => setCompagnies(res.data));
  }, []);

  async function handleCreer() {
    if (!compagnieId) return;
    setBusy(true);
    setError(null);
    try {
      await creerBordereau(Number(compagnieId));
      load();
    } catch {
      setError("Aucune facture en attente de réclamation pour cette compagnie.");
    } finally {
      setBusy(false);
    }
  }

  async function handleEnvoyer(id: number) {
    setBusy(true);
    try {
      await envoyerBordereau(id);
      load();
    } finally {
      setBusy(false);
    }
  }

  async function handleRegler(id: number) {
    const montant = montantRegle[id];
    if (!montant) return;
    setBusy(true);
    try {
      await reglerBordereau(id, Number(montant));
      setMontantRegle((m) => ({ ...m, [id]: "" }));
      load();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col gap-4 max-w-2xl">
      <div className="border rounded p-3 flex items-center gap-2">
        <select
          value={compagnieId}
          onChange={(e) => setCompagnieId(e.target.value)}
          className="border rounded px-3 py-2 flex-1"
        >
          <option value="">Compagnie…</option>
          {compagnies.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nom}
            </option>
          ))}
        </select>
        <button
          onClick={handleCreer}
          disabled={busy}
          className="border rounded px-3 py-2 disabled:opacity-50"
        >
          Générer un bordereau
        </button>
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}

      <ul className="flex flex-col gap-2 text-sm">
        {bordereaux.map((b) => (
          <li key={b.id} className="border rounded p-2">
            <div className="flex items-center justify-between">
              <span className="font-medium">
                {b.numero} - {b.compagnie.nom}
              </span>
              <span className="text-xs text-gray-500">{STATUT_LABELS[b.statut]}</span>
            </div>
            <div className="text-xs text-gray-600">
              {b.montant_regle} / {b.montant_total} F CFA réglés
              {b.nombre_factures !== null && ` - ${b.nombre_factures} facture(s)`}
            </div>
            <div className="flex gap-2 mt-2">
              {b.statut === "brouillon" && (
                <button
                  onClick={() => handleEnvoyer(b.id)}
                  disabled={busy}
                  className="border rounded px-2 py-1 text-xs disabled:opacity-50"
                >
                  Marquer envoyé
                </button>
              )}
              {(b.statut === "envoye" || b.statut === "paye_partiel") && (
                <>
                  <input
                    placeholder="Montant réglé"
                    value={montantRegle[b.id] ?? ""}
                    onChange={(e) =>
                      setMontantRegle((m) => ({ ...m, [b.id]: e.target.value }))
                    }
                    className="border rounded px-2 py-1 text-xs w-28"
                  />
                  <button
                    onClick={() => handleRegler(b.id)}
                    disabled={busy}
                    className="border rounded px-2 py-1 text-xs disabled:opacity-50"
                  >
                    Enregistrer un règlement
                  </button>
                </>
              )}
            </div>
          </li>
        ))}
        {bordereaux.length === 0 && <li className="text-gray-500">Aucun bordereau.</li>}
      </ul>
    </div>
  );
}
