"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { fetchPrisesEnCharge } from "@/features/assurances/assurances-api";
import type { PriseEnCharge } from "@/features/assurances/types";
import { createFacture, fetchFacturables } from "./caisse-api";
import type { Facturable, LigneInput } from "./types";
import { Button, Card, Input, Select } from "@/components/ui";

export function FacturationAction({ patientId }: { patientId: number }) {
  const router = useRouter();
  const [facturables, setFacturables] = useState<Facturable[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [designationLibre, setDesignationLibre] = useState("");
  const [prixLibre, setPrixLibre] = useState("");
  const [prisesEnCharge, setPrisesEnCharge] = useState<PriseEnCharge[]>([]);
  const [priseEnChargeId, setPriseEnChargeId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchFacturables(patientId).then((res) => setFacturables(res.data));
    fetchPrisesEnCharge("approuvee").then((res) =>
      setPrisesEnCharge(res.data.filter((p) => p.assurance_patient.patient?.id === patientId)),
    );
  }, [patientId]);

  function toggle(key: string) {
    setSelected((s) => {
      const next = new Set(s);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  async function handleSubmit() {
    const lignes: LigneInput[] = facturables
      .filter((f) => selected.has(`${f.type}-${f.id}`))
      .map((f) => ({ type: f.type, id: f.id }));

    if (designationLibre && prixLibre) {
      lignes.push({
        type: "libre",
        designation: designationLibre,
        prix_unitaire: Number(prixLibre),
        quantite: 1,
      });
    }

    if (lignes.length === 0) {
      setError("Sélectionnez au moins une prestation à facturer.");
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      const { data } = await createFacture(
        patientId,
        lignes,
        priseEnChargeId ? Number(priseEnChargeId) : undefined,
      );
      router.push(`/factures/${data.id}`);
    } catch {
      setError("Impossible de créer la facture.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Card className="flex flex-col gap-3 max-w-lg">
      <span className="font-semibold text-sm">Facturer</span>

      <ul className="flex flex-col gap-1 text-sm">
        {facturables.map((f) => {
          const key = `${f.type}-${f.id}`;
          return (
            <li key={key}>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={selected.has(key)}
                  onChange={() => toggle(key)}
                  className="accent-primary"
                />
                {f.designation} - {f.prix_unitaire} F CFA × {f.quantite}
              </label>
            </li>
          );
        })}
        {facturables.length === 0 && (
          <li className="text-muted">Aucune prestation en attente de facturation.</li>
        )}
      </ul>

      <div className="flex items-center gap-2 border-t border-border pt-3">
        <Input
          placeholder="Ligne libre (ex. Consultation)"
          value={designationLibre}
          onChange={(e) => setDesignationLibre(e.target.value)}
          className="flex-1"
        />
        <Input
          placeholder="Prix"
          value={prixLibre}
          onChange={(e) => setPrixLibre(e.target.value)}
          className="w-28"
        />
      </div>

      {prisesEnCharge.length > 0 && (
        <Select value={priseEnChargeId} onChange={(e) => setPriseEnChargeId(e.target.value)}>
          <option value="">Sans prise en charge</option>
          {prisesEnCharge.map((p) => (
            <option key={p.id} value={p.id}>
              {p.numero} - {p.assurance_patient.compagnie.nom}
              {p.montant_plafond ? ` (plafond ${p.montant_plafond} F CFA)` : ""}
            </option>
          ))}
        </Select>
      )}

      {error && (
        <p className="rounded-lg bg-danger-light px-3 py-2 text-sm text-danger">{error}</p>
      )}

      <Button onClick={handleSubmit} disabled={isSubmitting} className="self-start">
        Créer la facture
      </Button>
    </Card>
  );
}
