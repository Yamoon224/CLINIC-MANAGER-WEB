"use client";

import { useEffect, useState } from "react";
import { createLot, fetchLots, fetchVaccins } from "./vaccinations-api";
import type { LotVaccin, Vaccin } from "./types";
import { Badge, Button, Card, Input, Select } from "@/components/ui";

export function StockVaccins() {
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
        <option value="">Choisir un vaccin...</option>
        {vaccins.map((v) => (
          <option key={v.id} value={v.id}>
            {v.nom}
          </option>
        ))}
      </Select>

      {selected && (
        <>
          <Card className="p-0 max-w-2xl overflow-hidden">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="text-left border-b border-border">
                  <th className="py-2 px-4">Lot</th>
                  <th className="py-2 px-4">Péremption</th>
                  <th className="py-2 px-4">Restant / Initial</th>
                  <th className="py-2 px-4"></th>
                </tr>
              </thead>
              <tbody>
                {lots.map((lot) => (
                  <tr key={lot.id} className="border-b border-border last:border-0">
                    <td className="py-2 px-4">{lot.numero_lot}</td>
                    <td className="py-2 px-4">{lot.date_peremption}</td>
                    <td className="py-2 px-4">
                      {lot.quantite_restante} / {lot.quantite_initiale}
                    </td>
                    <td className="py-2 px-4">
                      {lot.est_perime && <Badge tone="danger">Périmé</Badge>}
                    </td>
                  </tr>
                ))}
                {lots.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-2 px-4 text-muted">
                      Aucun lot enregistré.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </Card>

          <Card className="flex items-center gap-2 max-w-2xl p-3">
            <Input
              placeholder="N° de lot"
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
              placeholder="Quantité"
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
              Réceptionner
            </Button>
          </Card>
        </>
      )}
    </div>
  );
}
