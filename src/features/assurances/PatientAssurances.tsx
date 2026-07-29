"use client";

import { useCallback, useEffect, useState } from "react";
import {
  createAssurancePatient,
  demanderPriseEnCharge,
  fetchAssurancesPatient,
  fetchCompagnies,
} from "./assurances-api";
import type { AssurancePatient, CompagnieAssurance } from "./types";
import { Badge, Button, Card, Input, Select } from "@/components/ui";

export function PatientAssurances({ patientId }: { patientId: number }) {
  const [assurances, setAssurances] = useState<AssurancePatient[] | null>(null);
  const [compagnies, setCompagnies] = useState<CompagnieAssurance[]>([]);
  const [compagnieId, setCompagnieId] = useState("");
  const [numeroAdherent, setNumeroAdherent] = useState("");
  const [dateDebut, setDateDebut] = useState("");
  const [dateFin, setDateFin] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    fetchAssurancesPatient(patientId).then((res) => setAssurances(res.data));
  }, [patientId]);

  useEffect(() => {
    load();
    fetchCompagnies().then((res) => setCompagnies(res.data));
  }, [load, patientId]);

  async function handleSubmit() {
    if (!compagnieId || !numeroAdherent || !dateDebut) return;
    setBusy(true);
    setError(null);
    try {
      await createAssurancePatient(patientId, {
        compagnie_assurance_id: Number(compagnieId),
        numero_adherent: numeroAdherent,
        date_debut: dateDebut,
        date_fin: dateFin || undefined,
      });
      setCompagnieId("");
      setNumeroAdherent("");
      setDateDebut("");
      setDateFin("");
      load();
    } catch {
      setError("Impossible d'enregistrer cette couverture.");
    } finally {
      setBusy(false);
    }
  }

  if (assurances === null) return null;

  return (
    <div>
      <h2 className="font-semibold mb-2 text-foreground">Assurances / tiers payant</h2>
      <ul className="flex flex-col gap-2 mb-3 text-sm">
        {assurances.map((a) => (
          <AssuranceRow key={a.id} assurance={a} onChanged={load} />
        ))}
        {assurances.length === 0 && (
          <li className="text-muted">Aucune couverture enregistrée.</li>
        )}
      </ul>

      <Card className="flex flex-col gap-3 max-w-lg">
        <span className="text-sm font-medium">Ajouter une couverture</span>
        <div className="flex gap-2">
          <Select value={compagnieId} onChange={(e) => setCompagnieId(e.target.value)} className="flex-1">
            <option value="">Compagnie…</option>
            {compagnies.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nom} ({c.taux_couverture_defaut}%)
              </option>
            ))}
          </Select>
          <Input
            placeholder="N° adhérent"
            value={numeroAdherent}
            onChange={(e) => setNumeroAdherent(e.target.value)}
            className="w-40"
          />
        </div>
        <div className="flex gap-2">
          <Input
            type="date"
            value={dateDebut}
            onChange={(e) => setDateDebut(e.target.value)}
            className="flex-1"
          />
          <Input
            type="date"
            value={dateFin}
            onChange={(e) => setDateFin(e.target.value)}
            className="flex-1"
          />
        </div>
        {error && (
          <p className="rounded-lg bg-danger-light px-3 py-2 text-sm text-danger">{error}</p>
        )}
        <Button onClick={handleSubmit} disabled={busy} className="self-start">
          Enregistrer
        </Button>
      </Card>
    </div>
  );
}

function AssuranceRow({
  assurance,
  onChanged,
}: {
  assurance: AssurancePatient;
  onChanged: () => void;
}) {
  const [showForm, setShowForm] = useState(false);
  const [motif, setMotif] = useState("");
  const [plafond, setPlafond] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleDemander() {
    if (!motif) return;
    setBusy(true);
    try {
      await demanderPriseEnCharge(assurance.id, {
        motif,
        montant_plafond: plafond ? Number(plafond) : undefined,
      });
      setMotif("");
      setPlafond("");
      setShowForm(false);
      onChanged();
    } finally {
      setBusy(false);
    }
  }

  return (
    <li className="rounded-xl border border-border bg-surface p-3">
      <div className="flex items-center justify-between">
        <span>
          {assurance.compagnie.nom} - {assurance.numero_adherent} ({assurance.taux_couverture}%)
        </span>
        <Badge tone={assurance.active ? "success" : "neutral"}>
          {assurance.active ? "Active" : assurance.statut}
        </Badge>
      </div>
      <div className="text-xs text-muted mt-1">
        Du {assurance.date_debut} {assurance.date_fin ? `au ${assurance.date_fin}` : "(sans échéance)"}
      </div>

      {!showForm ? (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowForm(true)}
          className="mt-2 px-0 text-primary"
        >
          Demander une prise en charge
        </Button>
      ) : (
        <div className="flex gap-2 mt-2">
          <Input
            placeholder="Motif"
            value={motif}
            onChange={(e) => setMotif(e.target.value)}
            className="flex-1 text-xs"
          />
          <Input
            placeholder="Plafond (optionnel)"
            value={plafond}
            onChange={(e) => setPlafond(e.target.value)}
            className="w-28 text-xs"
          />
          <Button size="sm" onClick={handleDemander} disabled={busy}>
            Envoyer
          </Button>
        </div>
      )}
    </li>
  );
}
