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
import { Badge, Button, Card, Input, Select } from "@/components/ui";

const STATUT_LABELS: Record<BordereauAssurance["statut"], string> = {
  brouillon: "Brouillon",
  envoye: "Envoyé",
  paye_partiel: "Payé partiellement",
  paye: "Payé",
};

const STATUT_TONES: Record<BordereauAssurance["statut"], "neutral" | "primary" | "warning" | "success"> = {
  brouillon: "neutral",
  envoye: "primary",
  paye_partiel: "warning",
  paye: "success",
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
      <Card className="flex items-center gap-2">
        <Select value={compagnieId} onChange={(e) => setCompagnieId(e.target.value)} className="flex-1">
          <option value="">Compagnie…</option>
          {compagnies.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nom}
            </option>
          ))}
        </Select>
        <Button variant="outline" onClick={handleCreer} disabled={busy}>
          Générer un bordereau
        </Button>
      </Card>
      {error && (
        <p className="rounded-lg bg-danger-light px-3 py-2 text-sm text-danger">{error}</p>
      )}

      <ul className="flex flex-col gap-2 text-sm">
        {bordereaux.map((b) => (
          <li key={b.id} className="rounded-xl border border-border bg-surface p-3">
            <div className="flex items-center justify-between">
              <span className="font-medium">
                {b.numero} - {b.compagnie.nom}
              </span>
              <Badge tone={STATUT_TONES[b.statut]}>{STATUT_LABELS[b.statut]}</Badge>
            </div>
            <div className="text-xs text-muted mt-1">
              {b.montant_regle} / {b.montant_total} F CFA réglés
              {b.nombre_factures !== null && ` - ${b.nombre_factures} facture(s)`}
            </div>
            <div className="flex items-center gap-2 mt-2">
              {b.statut === "brouillon" && (
                <Button variant="outline" size="sm" onClick={() => handleEnvoyer(b.id)} disabled={busy}>
                  Marquer envoyé
                </Button>
              )}
              {(b.statut === "envoye" || b.statut === "paye_partiel") && (
                <>
                  <Input
                    placeholder="Montant réglé"
                    value={montantRegle[b.id] ?? ""}
                    onChange={(e) =>
                      setMontantRegle((m) => ({ ...m, [b.id]: e.target.value }))
                    }
                    className="w-28 text-xs"
                  />
                  <Button variant="outline" size="sm" onClick={() => handleRegler(b.id)} disabled={busy}>
                    Enregistrer un règlement
                  </Button>
                </>
              )}
            </div>
          </li>
        ))}
        {bordereaux.length === 0 && <li className="text-muted">Aucun bordereau.</li>}
      </ul>
    </div>
  );
}
