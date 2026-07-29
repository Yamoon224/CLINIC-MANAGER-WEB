"use client";

import { useCallback, useEffect, useState } from "react";
import { annulerFacture, encaisser, fetchFacture } from "./caisse-api";
import { MODE_PAIEMENT_LABELS, type Facture, type ModePaiement } from "./types";
import { Badge, Button, Card, Input, PageHeader, Select } from "@/components/ui";

const STATUT_TONES: Record<Facture["statut"], "primary" | "warning" | "success" | "neutral"> = {
  ouverte: "primary",
  partiellement_payee: "warning",
  payee: "success",
  annulee: "neutral",
};

const STATUT_LABELS: Record<Facture["statut"], string> = {
  ouverte: "Ouverte",
  partiellement_payee: "Partiellement payée",
  payee: "Payée",
  annulee: "Annulée",
};

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

  if (!facture) return <p className="text-muted">Chargement...</p>;

  const active = facture.statut === "ouverte" || facture.statut === "partiellement_payee";

  return (
    <div className="flex flex-col gap-4 max-w-2xl">
      <PageHeader
        title={`Facture #${facture.id} - ${facture.patient.prenom} ${facture.patient.nom}`}
        description={`Dossier n° ${facture.patient.numero_dossier}`}
        actions={<Badge tone={STATUT_TONES[facture.statut]}>{STATUT_LABELS[facture.statut]}</Badge>}
      />

      <Card className="p-0 overflow-hidden">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="text-left border-b border-border bg-primary-light/40">
              <th className="py-2 px-4 font-medium text-muted">Désignation</th>
              <th className="py-2 px-4 font-medium text-muted">Qté</th>
              <th className="py-2 px-4 font-medium text-muted">P.U.</th>
              <th className="py-2 px-4 font-medium text-muted">Montant</th>
            </tr>
          </thead>
          <tbody>
            {facture.lignes.map((l) => (
              <tr key={l.id} className="border-b border-border last:border-0">
                <td className="py-2 px-4">{l.designation}</td>
                <td className="py-2 px-4">{l.quantite}</td>
                <td className="py-2 px-4">{l.prix_unitaire}</td>
                <td className="py-2 px-4">{l.montant}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <Card className="flex flex-col gap-1.5 max-w-xs text-sm">
        <div className="flex justify-between">
          <span>Total</span>
          <span className="font-semibold">{facture.montant_total} F CFA</span>
        </div>
        {facture.assurance_patient && (
          <>
            <div className="flex justify-between text-muted">
              <span>Part {facture.assurance_patient.compagnie}</span>
              <span>{facture.montant_part_assurance} F CFA</span>
            </div>
            <div className="flex justify-between text-muted">
              <span>Part patient</span>
              <span>{facture.montant_part_patient} F CFA</span>
            </div>
          </>
        )}
        <div className="flex justify-between">
          <span>Payé (patient)</span>
          <span>{facture.montant_paye} F CFA</span>
        </div>
        <div className="flex justify-between">
          <span>Solde patient</span>
          <span className="font-semibold">{facture.solde} F CFA</span>
        </div>
      </Card>

      <div>
        <h2 className="font-semibold mb-2 text-foreground">Encaissements</h2>
        <ul className="text-sm flex flex-col gap-2 mb-3">
          {facture.encaissements.map((e) => (
            <li key={e.id} className="rounded-xl border border-border bg-surface p-3">
              {e.montant} F CFA - {MODE_PAIEMENT_LABELS[e.mode_paiement]}
              {e.caissier && ` (${e.caissier.name})`}
            </li>
          ))}
          {facture.encaissements.length === 0 && (
            <li className="text-muted">Aucun encaissement.</li>
          )}
        </ul>

        {active && (
          <Card className="flex items-center gap-2">
            <Input
              placeholder="Montant"
              value={montant}
              onChange={(e) => setMontant(e.target.value)}
              className="w-32"
            />
            <Select
              value={modePaiement}
              onChange={(e) => setModePaiement(e.target.value as ModePaiement)}
              className="max-w-[10rem]"
            >
              {Object.entries(MODE_PAIEMENT_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </Select>
            <Input
              placeholder="Référence"
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              className="flex-1"
            />
            <Button onClick={handleEncaisser} disabled={busy}>
              Encaisser
            </Button>
          </Card>
        )}
        {error && (
          <p className="mt-2 rounded-lg bg-danger-light px-3 py-2 text-sm text-danger">{error}</p>
        )}
      </div>

      {facture.statut === "ouverte" && (
        <Button variant="ghost" onClick={handleAnnuler} disabled={busy} className="self-start text-danger hover:bg-danger-light">
          Annuler la facture
        </Button>
      )}
    </div>
  );
}
