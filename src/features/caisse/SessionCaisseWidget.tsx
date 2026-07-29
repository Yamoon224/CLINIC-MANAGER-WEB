"use client";

import { useCallback, useEffect, useState } from "react";
import { cloturerSession, fetchSessionCourante, ouvrirSession } from "./caisse-api";
import type { SessionCaisse } from "./types";
import { Button, Card, Input } from "@/components/ui";

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
          <Card className="text-sm">
            <p className="font-semibold">Rapport Z de la dernière session</p>
            <p className="mt-1">Théorique : {dernierRapport.montant_theorique} F CFA</p>
            <p>Compté : {dernierRapport.montant_cloture} F CFA</p>
            <p className={Number(dernierRapport.ecart) !== 0 ? "text-danger font-semibold" : ""}>
              Écart : {dernierRapport.ecart} F CFA
            </p>
          </Card>
        )}
        <Card className="flex items-center gap-2">
          <Input
            placeholder="Fonds de caisse initial"
            value={montantOuverture}
            onChange={(e) => setMontantOuverture(e.target.value)}
            className="flex-1"
          />
          <Button onClick={handleOuvrir} disabled={busy}>
            Ouvrir la session
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <Card className="flex flex-col gap-3 max-w-md">
      <p className="text-sm">
        Session ouverte - fonds initial {session.montant_ouverture} F CFA
      </p>
      <div className="flex items-center gap-2">
        <Input
          placeholder="Montant compté en caisse"
          value={montantCloture}
          onChange={(e) => setMontantCloture(e.target.value)}
          className="flex-1"
        />
        <Button variant="outline" onClick={handleCloturer} disabled={busy}>
          Clôturer (rapport Z)
        </Button>
      </div>
    </Card>
  );
}
