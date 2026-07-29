"use client";

import { useEffect, useState } from "react";
import {
  dispenser,
  fetchLots,
  fetchMedicaments,
  fetchSubstitutions,
} from "./pharmacie-api";
import type { LotMedicament, Medicament } from "./types";

export function DispensationForm({
  patientId,
  onDispensed,
}: {
  patientId: number;
  onDispensed?: () => void;
}) {
  const [medicaments, setMedicaments] = useState<Medicament[]>([]);
  const [medicamentId, setMedicamentId] = useState<number | "">("");
  const [medicamentOriginalId, setMedicamentOriginalId] = useState<number | null>(null);
  const [lots, setLots] = useState<LotMedicament[]>([]);
  const [lotId, setLotId] = useState<number | "">("");
  const [substitutions, setSubstitutions] = useState<Medicament[]>([]);
  const [quantite, setQuantite] = useState("1");
  const [urgente, setUrgente] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmation, setConfirmation] = useState<string | null>(null);

  useEffect(() => {
    fetchMedicaments().then((res) => setMedicaments(res.data));
  }, []);

  useEffect(() => {
    (async () => {
      if (!medicamentId) {
        setLots([]);
        setSubstitutions([]);
        return;
      }
      const [lotsRes, medicament] = await Promise.all([
        fetchLots(medicamentId),
        Promise.resolve(medicaments.find((m) => m.id === medicamentId)),
      ]);
      setLots(lotsRes.data.filter((l) => !l.est_perime && l.quantite_restante > 0));
      setSubstitutions(
        medicament && medicament.stock_disponible === 0
          ? (await fetchSubstitutions(medicamentId)).data
          : [],
      );
    })();
  }, [medicamentId, medicaments]);

  function chooseMedicament(id: number | "") {
    setMedicamentId(id);
    setLotId("");
  }

  function chooseSubstitute(id: number) {
    setMedicamentOriginalId(medicamentId || null);
    chooseMedicament(id);
  }

  async function handleSubmit() {
    if (!medicamentId || !lotId || !quantite) return;
    setIsSubmitting(true);
    setError(null);
    try {
      await dispenser({
        medicament_id: medicamentId,
        lot_medicament_id: lotId,
        quantite: Number(quantite),
        patient_id: patientId,
        medicament_original_id: medicamentOriginalId ?? undefined,
        urgente,
      });
      setConfirmation("Médicament dispensé.");
      setMedicamentId("");
      setMedicamentOriginalId(null);
      setLotId("");
      setQuantite("1");
      setUrgente(false);
      onDispensed?.();
    } catch {
      setError("Impossible de dispenser (stock insuffisant ?).");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="border rounded p-4 flex flex-col gap-2 max-w-md">
      <span className="font-semibold text-sm">Dispenser un médicament</span>

      <select
        value={medicamentId}
        onChange={(e) => chooseMedicament(e.target.value ? Number(e.target.value) : "")}
        className="border rounded px-3 py-2"
      >
        <option value="">Médicament...</option>
        {medicaments.map((m) => (
          <option key={m.id} value={m.id} disabled={m.stock_disponible === 0}>
            {m.dci} {m.dosage} - {m.stock_disponible} en stock
          </option>
        ))}
      </select>

      {substitutions.length > 0 && (
        <div className="text-sm border border-orange-300 bg-orange-50 rounded p-2">
          <p className="font-medium">Rupture - substituts disponibles :</p>
          <div className="flex flex-wrap gap-2 mt-1">
            {substitutions.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => chooseSubstitute(s.id)}
                className="border rounded px-2 py-1 bg-white"
              >
                {s.dci} ({s.stock_disponible})
              </button>
            ))}
          </div>
        </div>
      )}

      {lots.length > 0 && (
        <select
          value={lotId}
          onChange={(e) => setLotId(e.target.value ? Number(e.target.value) : "")}
          className="border rounded px-3 py-2"
        >
          <option value="">Lot...</option>
          {lots.map((l) => (
            <option key={l.id} value={l.id}>
              {l.numero_lot} - exp. {l.date_peremption} ({l.quantite_restante} dispo.)
            </option>
          ))}
        </select>
      )}

      <div className="flex items-center gap-2">
        <input
          type="number"
          min={1}
          value={quantite}
          onChange={(e) => setQuantite(e.target.value)}
          className="border rounded px-3 py-2 w-24"
        />
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={urgente} onChange={(e) => setUrgente(e.target.checked)} />
          Urgent
        </label>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}
      {confirmation && <p className="text-sm text-green-700">{confirmation}</p>}

      <button
        onClick={handleSubmit}
        disabled={isSubmitting || !medicamentId || !lotId}
        className="bg-blue-600 text-white rounded px-3 py-2 self-start disabled:opacity-50"
      >
        Dispenser
      </button>
    </div>
  );
}
