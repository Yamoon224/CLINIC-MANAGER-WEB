"use client";

import { useEffect, useState } from "react";
import { PackageX, Pill } from "lucide-react";
import { createLot, fetchLots, fetchMedicaments } from "./pharmacie-api";
import type { LotMedicament, Medicament } from "./types";
import { Badge, Button, Card, Input } from "@/components/ui";
import { useTranslation } from "@/lib/i18n/LanguageContext";

export function StockMedicaments() {
  const { t } = useTranslation();
  const [medicaments, setMedicaments] = useState<Medicament[]>([]);
  const [selected, setSelected] = useState<number | "">("");
  const [lots, setLots] = useState<LotMedicament[]>([]);

  const [numeroLot, setNumeroLot] = useState("");
  const [datePeremption, setDatePeremption] = useState("");
  const [quantite, setQuantite] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchMedicaments().then((res) => setMedicaments(res.data));
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

  const sousLeSeuilCount = medicaments.filter((m) => m.stock_disponible < m.seuil_alerte).length;

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-4 max-w-3xl">
        <Card className="flex items-center gap-3 p-4">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-light text-primary">
            <Pill size={18} />
          </span>
          <div className="min-w-0">
            <div className="text-xs font-medium text-muted">{t("pharmacie.statTotalMedicaments")}</div>
            <div className="mt-1 text-2xl font-semibold text-primary">{medicaments.length}</div>
          </div>
        </Card>
        <Card className="flex items-center gap-3 p-4">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-danger-light text-danger">
            <PackageX size={18} />
          </span>
          <div className="min-w-0">
            <div className="text-xs font-medium text-muted">{t("pharmacie.statSousLeSeuil")}</div>
            <div className="mt-1 text-2xl font-semibold text-danger">{sousLeSeuilCount}</div>
          </div>
        </Card>
      </div>
      <Card className="p-0 max-w-3xl overflow-hidden">
        <table className="table">
          <thead>
            <tr>
              <th>{t("pharmacie.colDci")}</th>
              <th>{t("pharmacie.colFormeDosage")}</th>
              <th>{t("pharmacie.colStockDisponible")}</th>
              <th>{t("pharmacie.colSeuilAlerte")}</th>
            </tr>
          </thead>
          <tbody>
            {medicaments.map((m) => (
              <tr
                key={m.id}
                onClick={() => setSelected(m.id)}
                className={`cursor-pointer transition-colors hover:bg-primary-light/60 ${selected === m.id ? "bg-primary-light" : ""}`}
              >
                <td>
                  {m.dci}
                  {m.nom_commercial && ` (${m.nom_commercial})`}
                </td>
                <td>
                  {m.forme} {m.dosage}
                </td>
                <td>
                  {m.stock_disponible < m.seuil_alerte ? (
                    <Badge tone="danger">{m.stock_disponible}</Badge>
                  ) : (
                    m.stock_disponible
                  )}
                </td>
                <td>{m.seuil_alerte}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      {selected && (
        <>
          <Card className="p-0 max-w-2xl overflow-hidden">
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
                      {lot.est_perime && <Badge tone="danger">{t("pharmacie.perime")}</Badge>}
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

          <Card className="flex items-center gap-2 max-w-2xl p-3">
            <Input
              placeholder={t("pharmacie.numeroLotPlaceholder")}
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
