"use client";

import { useEffect, useState } from "react";
import { Boxes, PackageX } from "lucide-react";
import { createLot, fetchLots, fetchVaccins } from "./vaccinations-api";
import type { LotVaccin, Vaccin } from "./types";
import { Badge, Button, Card, Input, Modal, Select } from "@/components/ui";
import { useTranslation } from "@/lib/i18n/LanguageContext";

export function StockVaccins() {
  const { t } = useTranslation();
  const [vaccins, setVaccins] = useState<Vaccin[]>([]);
  const [selected, setSelected] = useState<number | "">("");
  const [lots, setLots] = useState<LotVaccin[]>([]);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetchVaccins().then((res) => setVaccins(res.data));
  }, []);

  useEffect(() => {
    (async () => {
      setLots(selected ? (await fetchLots(selected)).data : []);
    })();
    setShowForm(false);
  }, [selected]);

  function reloadLots() {
    if (selected) fetchLots(selected).then((res) => setLots(res.data));
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
          <div className="grid grid-cols-2 gap-4 max-w-2xl">
            <Card className="flex items-center gap-3 p-4">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-light text-primary">
                <Boxes size={18} />
              </span>
              <div className="min-w-0">
                <div className="text-xs font-medium text-muted">{t("vaccinations.statLots")}</div>
                <div className="mt-1 text-2xl font-semibold text-primary">{lots.length}</div>
              </div>
            </Card>
            <Card className="flex items-center gap-3 p-4">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-danger-light text-danger">
                <PackageX size={18} />
              </span>
              <div className="min-w-0">
                <div className="text-xs font-medium text-muted">{t("vaccinations.statLotsPerimes")}</div>
                <div className="mt-1 text-2xl font-semibold text-danger">
                  {lots.filter((l) => l.est_perime).length}
                </div>
              </div>
            </Card>
          </div>
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

          <Button onClick={() => setShowForm(true)} className="self-start">
            + {t("vaccinations.addLot")}
          </Button>

          <Modal
            open={showForm}
            onClose={() => setShowForm(false)}
            title={t("vaccinations.addLot")}
          >
            <AddLotForm
              vaccinId={selected}
              onCancel={() => setShowForm(false)}
              onCreated={() => {
                setShowForm(false);
                reloadLots();
              }}
            />
          </Modal>
        </>
      )}
    </div>
  );
}

function AddLotForm({
  vaccinId,
  onCancel,
  onCreated,
}: {
  vaccinId: number;
  onCancel?: () => void;
  onCreated: () => void;
}) {
  const { t } = useTranslation();
  const [numeroLot, setNumeroLot] = useState("");
  const [datePeremption, setDatePeremption] = useState("");
  const [quantite, setQuantite] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleCreateLot() {
    if (!numeroLot || !datePeremption || !quantite) return;
    setIsSubmitting(true);
    try {
      await createLot(vaccinId, {
        numero_lot: numeroLot,
        date_peremption: datePeremption,
        quantite_initiale: Number(quantite),
      });
      setNumeroLot("");
      setDatePeremption("");
      setQuantite("");
      onCreated();
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
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
      </div>
      <div className="flex gap-2">
        <Button onClick={handleCreateLot} disabled={isSubmitting}>
          {t("vaccinations.receive")}
        </Button>
        {onCancel && (
          <Button variant="outline" onClick={onCancel}>
            {t("common.cancel")}
          </Button>
        )}
      </div>
    </div>
  );
}
