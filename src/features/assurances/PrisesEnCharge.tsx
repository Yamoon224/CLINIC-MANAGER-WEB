"use client";

import { useEffect, useState } from "react";
import { fetchPrisesEnCharge, traiterPriseEnCharge } from "./assurances-api";
import type { PriseEnCharge, PriseEnChargeStatut } from "./types";
import { Badge, Button, Select } from "@/components/ui";
import { useTranslation } from "@/lib/i18n/LanguageContext";

const STATUT_TONES: Record<PriseEnChargeStatut, "warning" | "success" | "danger"> = {
  en_attente: "warning",
  approuvee: "success",
  refusee: "danger",
};

export function PrisesEnCharge() {
  const { t } = useTranslation();
  const [statut, setStatut] = useState<PriseEnChargeStatut | "">("en_attente");
  const [prises, setPrises] = useState<PriseEnCharge[]>([]);
  const [busyId, setBusyId] = useState<number | null>(null);

  function load() {
    fetchPrisesEnCharge(statut || undefined).then((res) => setPrises(res.data));
  }

  useEffect(() => {
    fetchPrisesEnCharge(statut || undefined).then((res) => setPrises(res.data));
  }, [statut]);

  async function handleTraiter(id: number, decision: "approuvee" | "refusee") {
    setBusyId(id);
    try {
      await traiterPriseEnCharge(id, decision);
      load();
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="flex flex-col gap-3 max-w-2xl">
      <div className="flex items-center justify-between gap-2">
        <Select
          value={statut}
          onChange={(e) => setStatut(e.target.value as PriseEnChargeStatut | "")}
          className="w-56"
        >
          <option value="">{t("assurances.prisesEnCharge.tousStatuts")}</option>
          {(Object.keys(STATUT_TONES) as PriseEnChargeStatut[]).map((value) => (
            <option key={value} value={value}>
              {t(`assurances.priseEnChargeStatut.${value}`)}
            </option>
          ))}
        </Select>
        <span className="text-xs text-muted">
          {t("assurances.prisesEnCharge.resultsCount", { count: prises.length })}
        </span>
      </div>

      <ul className="flex flex-col gap-2 text-sm">
        {prises.map((p) => (
          <li key={p.id} className="rounded-xl border border-border bg-surface p-3">
            <div className="flex items-center justify-between">
              <span className="font-medium">{p.numero}</span>
              <Badge tone={STATUT_TONES[p.statut]}>
                {t(`assurances.priseEnChargeStatut.${p.statut}`)}
              </Badge>
            </div>
            <div className="text-xs text-muted mt-1">
              {p.assurance_patient.patient &&
                `${p.assurance_patient.patient.prenom} ${p.assurance_patient.patient.nom} - `}
              {p.assurance_patient.compagnie.nom}
            </div>
            <div className="text-xs mt-1">
              {p.motif}
              {p.montant_plafond &&
                t("assurances.prisesEnCharge.plafondSuffix", { montant: p.montant_plafond })}
            </div>
            {p.statut === "en_attente" && (
              <div className="flex gap-2 mt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleTraiter(p.id, "approuvee")}
                  disabled={busyId === p.id}
                  className="text-success hover:bg-success-light"
                >
                  {t("assurances.prisesEnCharge.approuver")}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleTraiter(p.id, "refusee")}
                  disabled={busyId === p.id}
                  className="text-danger hover:bg-danger-light"
                >
                  {t("assurances.prisesEnCharge.refuser")}
                </Button>
              </div>
            )}
          </li>
        ))}
        {prises.length === 0 && <li className="text-muted">{t("assurances.prisesEnCharge.empty")}</li>}
      </ul>
    </div>
  );
}
