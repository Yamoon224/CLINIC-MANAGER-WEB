"use client";

import { useCallback, useEffect, useState } from "react";
import { fetchPrisesEnCharge, traiterPriseEnCharge } from "./assurances-api";
import type { PriseEnCharge, PriseEnChargeStatut } from "./types";
import { Badge, Button, DataTable, Select, type Column, type Tone } from "@/components/ui";
import { useTranslation } from "@/lib/i18n/LanguageContext";

const STATUT_TONES: Record<PriseEnChargeStatut, Tone> = {
  en_attente: "warning",
  approuvee: "success",
  refusee: "danger",
};

export function PrisesEnCharge() {
  const { t } = useTranslation();
  const [statut, setStatut] = useState<PriseEnChargeStatut | "">("en_attente");
  const [prises, setPrises] = useState<PriseEnCharge[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<number | null>(null);

  const load = useCallback(() => {
    fetchPrisesEnCharge(statut || undefined)
      .then((res) => setPrises(res.data))
      .finally(() => setLoading(false));
  }, [statut]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleTraiter(id: number, decision: "approuvee" | "refusee") {
    setBusyId(id);
    try {
      await traiterPriseEnCharge(id, decision);
      load();
    } finally {
      setBusyId(null);
    }
  }

  const columns: Column<PriseEnCharge>[] = [
    {
      key: "numero",
      header: t("assurances.prisesEnCharge.numero"),
      cell: (p) => <span className="font-semibold text-heading">{p.numero}</span>,
    },
    {
      key: "patient",
      header: t("assurances.prisesEnCharge.patient"),
      cell: (p) =>
        p.assurance_patient.patient
          ? `${p.assurance_patient.patient.prenom} ${p.assurance_patient.patient.nom}`
          : "-",
    },
    {
      key: "compagnie",
      header: t("assurances.prisesEnCharge.compagnie"),
      cell: (p) => p.assurance_patient.compagnie.nom,
    },
    {
      key: "motif",
      header: t("assurances.prisesEnCharge.motif"),
      cell: (p) => (
        <span>
          {p.motif}
          {p.montant_plafond
            ? t("assurances.prisesEnCharge.plafondSuffix", {
                montant: p.montant_plafond,
              })
            : ""}
        </span>
      ),
    },
    {
      key: "statut",
      header: t("common.status"),
      cell: (p) => (
        <Badge tone={STATUT_TONES[p.statut]} border>
          {t(`assurances.priseEnChargeStatut.${p.statut}`)}
        </Badge>
      ),
    },
    {
      key: "actions",
      header: "",
      className: "text-right",
      headClassName: "text-right",
      cell: (p) =>
        p.statut === "en_attente" ? (
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleTraiter(p.id, "approuvee")}
              disabled={busyId === p.id}
              className="border-success/40 text-success hover:bg-success-light"
            >
              {t("assurances.prisesEnCharge.approuver")}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleTraiter(p.id, "refusee")}
              disabled={busyId === p.id}
              className="border-danger/40 text-danger hover:bg-danger-light"
            >
              {t("assurances.prisesEnCharge.refuser")}
            </Button>
          </div>
        ) : null,
    },
  ];

  return (
    <DataTable
      columns={columns}
      rows={prises}
      getRowKey={(p) => p.id}
      loading={loading}
      emptyLabel={t("assurances.prisesEnCharge.empty")}
      toolbarRight={
        <Select
          value={statut}
          onChange={(e) => setStatut(e.target.value as PriseEnChargeStatut | "")}
          className="w-52"
        >
          <option value="">{t("assurances.prisesEnCharge.tousStatuts")}</option>
          {(Object.keys(STATUT_TONES) as PriseEnChargeStatut[]).map((value) => (
            <option key={value} value={value}>
              {t(`assurances.priseEnChargeStatut.${value}`)}
            </option>
          ))}
        </Select>
      }
    />
  );
}
