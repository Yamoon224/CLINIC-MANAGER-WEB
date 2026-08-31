"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { fetchPrisesEnCharge } from "@/features/assurances/assurances-api";
import type { PriseEnCharge } from "@/features/assurances/types";
import { createFacture, fetchFacturables } from "./caisse-api";
import type { Facturable, LigneInput } from "./types";
import { Button, Input, Select } from "@/components/ui";
import { useTranslation } from "@/lib/i18n/LanguageContext";

export function FacturationAction({
  patientId,
  onCancel,
}: {
  patientId: number;
  onCancel?: () => void;
}) {
  const { t } = useTranslation();
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
      setError(t("caisse.facturation.errorEmpty"));
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
      setError(t("caisse.facturation.errorSubmit"));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <ul className="flex flex-col gap-1.5 text-sm">
        {facturables.map((f) => {
          const key = `${f.type}-${f.id}`;
          return (
            <li key={key}>
              <label
                className={`flex items-center gap-2 rounded-lg border px-3 py-2 transition-colors ${
                  selected.has(key)
                    ? "border-primary bg-primary-light/60"
                    : "border-border bg-surface hover:bg-primary-light/30"
                }`}
              >
                <input
                  type="checkbox"
                  checked={selected.has(key)}
                  onChange={() => toggle(key)}
                  className="accent-primary"
                />
                {t("caisse.facturation.line", {
                  designation: f.designation,
                  prix: f.prix_unitaire,
                  quantite: f.quantite,
                })}
              </label>
            </li>
          );
        })}
        {facturables.length === 0 && (
          <li className="text-muted">{t("caisse.facturation.empty")}</li>
        )}
      </ul>

      <div className="flex items-center gap-2 border-t border-border pt-3">
        <Input
          placeholder={t("caisse.facturation.ligneLibrePlaceholder")}
          value={designationLibre}
          onChange={(e) => setDesignationLibre(e.target.value)}
          className="flex-1"
        />
        <Input
          placeholder={t("caisse.facturation.prixPlaceholder")}
          value={prixLibre}
          onChange={(e) => setPrixLibre(e.target.value)}
          className="w-28"
        />
      </div>

      {prisesEnCharge.length > 0 && (
        <Select value={priseEnChargeId} onChange={(e) => setPriseEnChargeId(e.target.value)}>
          <option value="">{t("caisse.facturation.sansPriseEnCharge")}</option>
          {prisesEnCharge.map((p) => (
            <option key={p.id} value={p.id}>
              {t("caisse.facturation.priseEnChargeOption", {
                numero: p.numero,
                compagnie: p.assurance_patient.compagnie.nom,
              })}
              {p.montant_plafond
                ? t("caisse.facturation.plafondSuffix", { montant: p.montant_plafond })
                : ""}
            </option>
          ))}
        </Select>
      )}

      {error && (
        <p className="rounded-[5px] bg-danger-light px-3 py-2 text-sm text-danger">{error}</p>
      )}

      <div className="flex gap-2">
        <Button onClick={handleSubmit} disabled={isSubmitting}>
          {t("caisse.facturation.submit")}
        </Button>
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            {t("common.cancel")}
          </Button>
        )}
      </div>
    </div>
  );
}
