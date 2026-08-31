"use client";

import { useEffect, useState } from "react";
import { IconPackageOff, IconPill } from "@tabler/icons-react";
import { createLot, fetchLots, fetchMedicaments } from "./pharmacie-api";
import type { LotMedicament, Medicament } from "./types";
import {
  Badge,
  Button,
  Card,
  DataTable,
  DateInput,
  Input,
  StatCard,
  type Column,
} from "@/components/ui";
import { useTranslation } from "@/lib/i18n/LanguageContext";

export function StockMedicaments() {
  const { t } = useTranslation();
  const [medicaments, setMedicaments] = useState<Medicament[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<number | "">("");
  const [lots, setLots] = useState<LotMedicament[]>([]);

  const [numeroLot, setNumeroLot] = useState("");
  const [datePeremption, setDatePeremption] = useState("");
  const [quantite, setQuantite] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchMedicaments()
      .then((res) => setMedicaments(res.data))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    (async () => {
      setLots(selected ? (await fetchLots(selected)).data : []);
    })();
  }, [selected]);

  async function handleCreateLot() {
    if (!selected || !numeroLot || !datePeremption || !quantite) return;
    setIsSubmitting(true);
    try {
      await createLot(selected, {
        numero_lot: numeroLot,
        date_peremption: datePeremption,
        quantite_initiale: Number(quantite),
      });
      setNumeroLot("");
      setDatePeremption("");
      setQuantite("");
      fetchLots(selected).then((res) => setLots(res.data));
      fetchMedicaments().then((res) => setMedicaments(res.data));
    } finally {
      setIsSubmitting(false);
    }
  }

  const sousLeSeuilCount = medicaments.filter(
    (m) => m.stock_disponible < m.seuil_alerte,
  ).length;

  const columns: Column<Medicament>[] = [
    {
      key: "dci",
      header: t("pharmacie.colDci"),
      cell: (m) => (
        <span className="font-semibold text-heading">
          {m.dci}
          {m.nom_commercial && (
            <span className="font-normal text-muted"> ({m.nom_commercial})</span>
          )}
        </span>
      ),
    },
    {
      key: "forme",
      header: t("pharmacie.colFormeDosage"),
      cell: (m) => `${m.forme} ${m.dosage}`,
    },
    {
      key: "stock",
      header: t("pharmacie.colStockDisponible"),
      cell: (m) =>
        m.stock_disponible < m.seuil_alerte ? (
          <Badge tone="danger">{m.stock_disponible}</Badge>
        ) : (
          m.stock_disponible
        ),
    },
    {
      key: "seuil",
      header: t("pharmacie.colSeuilAlerte"),
      cell: (m) => m.seuil_alerte,
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-4">
        <StatCard
          icon={<IconPill size={18} />}
          label={t("pharmacie.statTotalMedicaments")}
          value={medicaments.length}
          tone="primary"
        />
        <StatCard
          icon={<IconPackageOff size={18} />}
          label={t("pharmacie.statSousLeSeuil")}
          value={sousLeSeuilCount}
          tone="danger"
        />
      </div>

      <DataTable
        columns={columns}
        rows={medicaments}
        getRowKey={(m) => m.id}
        searchAccessor={(m) => `${m.dci} ${m.nom_commercial ?? ""} ${m.forme}`}
        loading={loading}
        onRowClick={(m) => setSelected(m.id)}
      />

      {selected && (
        <>
          <Card className="overflow-hidden p-0">
            <table className="table">
              <thead>
                <tr>
                  <th>{t("pharmacie.colLot")}</th>
                  <th>{t("pharmacie.colPeremption")}</th>
                  <th>{t("pharmacie.colRestantInitial")}</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {lots.map((lot) => (
                  <tr key={lot.id}>
                    <td>{lot.numero_lot}</td>
                    <td>{lot.date_peremption}</td>
                    <td>
                      {lot.quantite_restante} / {lot.quantite_initiale}
                    </td>
                    <td>
                      {lot.est_perime && (
                        <Badge tone="danger">{t("pharmacie.perime")}</Badge>
                      )}
                    </td>
                  </tr>
                ))}
                {lots.length === 0 && (
                  <tr>
                    <td colSpan={4} className="text-muted">
                      {t("pharmacie.noLots")}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </Card>

          <Card className="flex flex-wrap items-end gap-2">
            <Input
              placeholder={t("pharmacie.numeroLotPlaceholder")}
              value={numeroLot}
              onChange={(e) => setNumeroLot(e.target.value)}
              className="flex-1"
            />
            <DateInput
              value={datePeremption}
              onChange={(e) => setDatePeremption(e.target.value)}
              className="w-auto"
            />
            <Input
              placeholder={t("pharmacie.quantitePlaceholder")}
              value={quantite}
              onChange={(e) => setQuantite(e.target.value)}
              className="w-28"
            />
            <Button
              variant="outline"
              onClick={handleCreateLot}
              disabled={isSubmitting}
              className="whitespace-nowrap"
            >
              {t("pharmacie.receive")}
            </Button>
          </Card>
        </>
      )}
    </div>
  );
}
