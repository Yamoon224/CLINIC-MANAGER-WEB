"use client";

import { useEffect, useState } from "react";
import { createLot, fetchLots, fetchMedicaments } from "./pharmacie-api";
import type { LotMedicament, Medicament } from "./types";

export function StockMedicaments() {
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

  return (
    <div className="flex flex-col gap-4">
      <table className="w-full text-sm border-collapse max-w-3xl">
        <thead>
          <tr className="text-left border-b">
            <th className="py-2 pr-4">DCI</th>
            <th className="py-2 pr-4">Forme / Dosage</th>
            <th className="py-2 pr-4">Stock disponible</th>
            <th className="py-2 pr-4">Seuil d&apos;alerte</th>
          </tr>
        </thead>
        <tbody>
          {medicaments.map((m) => (
            <tr
              key={m.id}
              onClick={() => setSelected(m.id)}
              className={`border-b cursor-pointer ${selected === m.id ? "bg-blue-50" : ""} ${m.stock_disponible < m.seuil_alerte ? "text-red-700" : ""}`}
            >
              <td className="py-2 pr-4">
                {m.dci}
                {m.nom_commercial && ` (${m.nom_commercial})`}
              </td>
              <td className="py-2 pr-4">
                {m.forme} {m.dosage}
              </td>
              <td className="py-2 pr-4">{m.stock_disponible}</td>
              <td className="py-2 pr-4">{m.seuil_alerte}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {selected && (
        <>
          <table className="w-full text-sm border-collapse max-w-2xl">
            <thead>
              <tr className="text-left border-b">
                <th className="py-2 pr-4">Lot</th>
                <th className="py-2 pr-4">Péremption</th>
                <th className="py-2 pr-4">Restant / Initial</th>
                <th className="py-2 pr-4"></th>
              </tr>
            </thead>
            <tbody>
              {lots.map((lot) => (
                <tr key={lot.id} className="border-b">
                  <td className="py-2 pr-4">{lot.numero_lot}</td>
                  <td className="py-2 pr-4">{lot.date_peremption}</td>
                  <td className="py-2 pr-4">
                    {lot.quantite_restante} / {lot.quantite_initiale}
                  </td>
                  <td className="py-2 pr-4">
                    {lot.est_perime && (
                      <span className="text-red-600 font-medium">Périmé</span>
                    )}
                  </td>
                </tr>
              ))}
              {lots.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-2 text-gray-500">
                    Aucun lot enregistré.
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          <div className="border rounded p-3 flex items-center gap-2 max-w-2xl">
            <input
              placeholder="N° de lot"
              value={numeroLot}
              onChange={(e) => setNumeroLot(e.target.value)}
              className="border rounded px-3 py-2 flex-1"
            />
            <input
              type="date"
              value={datePeremption}
              onChange={(e) => setDatePeremption(e.target.value)}
              className="border rounded px-3 py-2"
            />
            <input
              placeholder="Quantité"
              value={quantite}
              onChange={(e) => setQuantite(e.target.value)}
              className="border rounded px-3 py-2 w-28"
            />
            <button
              onClick={handleCreateLot}
              disabled={isSubmitting}
              className="border rounded px-3 py-2 whitespace-nowrap disabled:opacity-50"
            >
              Réceptionner
            </button>
          </div>
        </>
      )}
    </div>
  );
}
