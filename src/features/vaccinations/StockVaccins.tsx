"use client";

import { useEffect, useState } from "react";
import { createLot, fetchLots, fetchVaccins } from "./vaccinations-api";
import type { LotVaccin, Vaccin } from "./types";
import { Badge, Button, Card, Input, Select } from "@/components/ui";
import { useTranslation } from "@/lib/i18n/LanguageContext";

export function StockVaccins() {
  const { t } = useTranslation();
  const [vaccins, setVaccins] = useState<Vaccin[]>([]);
  const [selected, setSelected] = useState<number | "">("");
  const [lots, setLots] = useState<LotVaccin[]>([]);

  const [numeroLot, setNumeroLot] = useState("");
  const [datePeremption, setDatePeremption] = useState("");
  const [quantite, setQuantite] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchVaccins().then((res) => setVaccins(res.data));
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
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <Select
        value={selected}
        onChange={(e) => setSelected(e.target.value ? Number(e.target.value) : "")}
        className="max-w-sm"
      >
        <option value="">{t("vaccinations.chooseVaccinPlaceholder")}</option>
        {vaccins.map((v) => (
          <option key={v.id} value={v.id}>
            {v.nom}
          </option>
        ))}
      </Select>

      {selected && (
        <>
          <Card className="p-0 max-w-2xl overflow-hidden">
            <table className="table">
              <thead>
                <tr>
                  <th>{t("vaccinations.colLot")}</th>
                  <th>{t("vaccinations.colPeremption")}</th>
                  <th>{t("vaccinations.colRestantInitial")}</th>
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
                      {lot.est_perime && <Badge tone="danger">{t("vaccinations.perime")}</Badge>}
                    </td>
                  </tr>
                ))}
                {lots.length === 0 && (
                  <tr>
                    <td colSpan={4} className="text-muted">
                      {t("vaccinations.noLots")}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </Card>

          <Card className="flex items-center gap-2 max-w-2xl p-3">
            <Input
              placeholder={t("vaccinations.numeroLotPlaceholder")}
              value={numeroLot}
              onChange={(e) => setNumeroLot(e.target.value)}
              className="flex-1"
            />
            <Input
              type="date"
              value={datePeremption}
              onChange={(e) => setDatePeremption(e.target.value)}
              className="w-auto"
            />
            <Input
              placeholder={t("vaccinations.quantitePlaceholder")}
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
              {t("vaccinations.receive")}
            </Button>
          </Card>
        </>
      )}
    </div>
  );
}
