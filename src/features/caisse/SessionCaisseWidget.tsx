"use client";

import { useCallback, useEffect, useState } from "react";
import { cloturerSession, fetchSessionCourante, ouvrirSession } from "./caisse-api";
import type { SessionCaisse } from "./types";

export function SessionCaisseWidget() {
  const [session, setSession] = useState<SessionCaisse | null | undefined>(undefined);
  const [dernierRapport, setDernierRapport] = useState<SessionCaisse | null>(null);
  const [montantOuverture, setMontantOuverture] = useState("20000");
  const [montantCloture, setMontantCloture] = useState("");
  const [busy, setBusy] = useState(false);

  const load = useCallback(() => {
    fetchSessionCourante().then((res) => setSession(res.data));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handleOuvrir() {
    setBusy(true);
    try {
      await ouvrirSession(Number(montantOuverture));
      setDernierRapport(null);
      load();
    } finally {
      setBusy(false);
    }
  }

  async function handleCloturer() {
    if (!session || !montantCloture) return;
    setBusy(true);
    try {
      const { data } = await cloturerSession(session.id, Number(montantCloture));
      setDernierRapport(data);
      setMontantCloture("");
      load();
    } finally {
      setBusy(false);
    }
  }

  if (session === undefined) return null;

  if (!session) {
    return (
      <div className="flex flex-col gap-4 max-w-md">
        {dernierRapport && (
          <div className="border rounded p-4 text-sm">
            <p className="font-semibold">Rapport Z de la dernière session</p>
            <p>Théorique : {dernierRapport.montant_theorique} F CFA</p>
            <p>Compté : {dernierRapport.montant_cloture} F CFA</p>
            <p className={Number(dernierRapport.ecart) !== 0 ? "text-red-600 font-semibold" : ""}>
              Écart : {dernierRapport.ecart} F CFA
            </p>
          </div>
        )}
        <div className="border rounded p-4 flex items-center gap-2">
          <input
            placeholder="Fonds de caisse initial"
            value={montantOuverture}
            onChange={(e) => setMontantOuverture(e.target.value)}
            className="border rounded px-3 py-2 flex-1"
          />
          <button
            onClick={handleOuvrir}
            disabled={busy}
            className="bg-blue-600 text-white rounded px-3 py-2 disabled:opacity-50"
          >
            Ouvrir la session
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="border rounded p-4 flex flex-col gap-2 max-w-md">
      <p className="text-sm">
        Session ouverte — fonds initial {session.montant_ouverture} F CFA
      </p>
      <div className="flex items-center gap-2">
        <input
          placeholder="Montant compté en caisse"
          value={montantCloture}
          onChange={(e) => setMontantCloture(e.target.value)}
          className="border rounded px-3 py-2 flex-1"
        />
        <button
          onClick={handleCloturer}
          disabled={busy}
          className="border rounded px-3 py-2 disabled:opacity-50"
        >
          Clôturer (rapport Z)
        </button>
      </div>
    </div>
  );
}
