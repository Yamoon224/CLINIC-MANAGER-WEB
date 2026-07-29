"use client";

import { useEffect, useState } from "react";
import {
  dispenser,
  fetchLots,
  fetchMedicaments,
  fetchSubstitutions,
} from "./pharmacie-api";
import type { LotMedicament, Medicament } from "./types";
import { Badge, Button, Card, Input, Select } from "@/components/ui";
import { useTranslation } from "@/lib/i18n/LanguageContext";

export function DispensationForm({
  patientId,
  onDispensed,
}: {
  patientId: number;
  onDispensed?: () => void;
}) {
  const { t } = useTranslation();
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
    <Card className="flex flex-col gap-3 max-w-md p-4">
      <span className="font-semibold text-sm text-foreground">Dispenser un médicament</span>

      <Select
        value={medicamentId}
        onChange={(e) => chooseMedicament(e.target.value ? Number(e.target.value) : "")}
      >
        <option value="">Médicament...</option>
        {medicaments.map((m) => (
          <option key={m.id} value={m.id} disabled={m.stock_disponible === 0}>
            {m.dci} {m.dosage} - {m.stock_disponible} en stock
          </option>
        ))}
      </Select>

      {substitutions.length > 0 && (
        <div className="rounded-lg border border-warning/30 bg-warning-light p-2 text-sm">
          <p className="font-medium text-foreground">Rupture - substituts disponibles :</p>
          <div className="flex flex-wrap gap-2 mt-2">
            {substitutions.map((s) => (
              <Button
                key={s.id}
                type="button"
                variant="outline"
                size="sm"
                onClick={() => chooseSubstitute(s.id)}
              >
                {s.dci} ({s.stock_disponible})
              </Button>
            ))}
          </div>
        </div>
      )}

      {lots.length > 0 && (
        <Select
          value={lotId}
          onChange={(e) => setLotId(e.target.value ? Number(e.target.value) : "")}
        >
          <option value="">Lot...</option>
          {lots.map((l) => (
            <option key={l.id} value={l.id}>
              {l.numero_lot} - exp. {l.date_peremption} ({l.quantite_restante} dispo.)
            </option>
          ))}
        </Select>
      )}

      <div className="flex items-center gap-3">
        <Input
          type="number"
          min={1}
          placeholder="Quantité"
          value={quantite}
          onChange={(e) => setQuantite(e.target.value)}
          className="w-24"
        />
        <label className="flex items-center gap-2 text-sm text-foreground">
          <input type="checkbox" checked={urgente} onChange={(e) => setUrgente(e.target.checked)} />
          Urgent
        </label>
        {urgente && <Badge tone="danger">Urgent</Badge>}
      </div>

      {error && <p className="text-sm text-danger">{error}</p>}
      {confirmation && <p className="text-sm text-success">{confirmation}</p>}

      <Button
        onClick={handleSubmit}
        disabled={isSubmitting || !medicamentId || !lotId}
        className="self-start"
      >
        Dispenser
      </Button>
    </Card>
  );
}
