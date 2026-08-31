"use client";

import { useEffect, useState } from "react";
import { IconAlertTriangle } from "@tabler/icons-react";
import {
  dispenser,
  fetchLots,
  fetchMedicaments,
  fetchSubstitutions,
} from "./pharmacie-api";
import type { LotMedicament, Medicament } from "./types";
import { Badge, Button, Input, Select } from "@/components/ui";
import { useTranslation } from "@/lib/i18n/LanguageContext";

export function DispensationForm({
  patientId,
  presetMedicamentId,
  prescriptionId,
  onDispensed,
  onCancel,
}: {
  patientId: number;
  presetMedicamentId?: number;
  prescriptionId?: number;
  onDispensed?: () => void;
  onCancel?: () => void;
}) {
  const { t } = useTranslation();
  const [medicaments, setMedicaments] = useState<Medicament[]>([]);
  const [medicamentId, setMedicamentId] = useState<number | "">(presetMedicamentId ?? "");
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
        prescription_id: prescriptionId,
        medicament_original_id: medicamentOriginalId ?? undefined,
        urgente,
      });
      setConfirmation(t("pharmacie.dispensedConfirmation"));
      setMedicamentId("");
      setMedicamentOriginalId(null);
      setLotId("");
      setQuantite("1");
      setUrgente(false);
      onDispensed?.();
    } catch {
      setError(t("pharmacie.dispenseError"));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex flex-col gap-3">
      {presetMedicamentId ? (
        <p className="text-sm font-medium text-heading">
          {medicaments.find((m) => m.id === presetMedicamentId)?.dci ?? "…"}
        </p>
      ) : (
        <Select
          value={medicamentId}
          onChange={(e) => chooseMedicament(e.target.value ? Number(e.target.value) : "")}
        >
          <option value="">{t("pharmacie.selectMedicamentPlaceholder")}</option>
          {medicaments.map((m) => (
            <option key={m.id} value={m.id} disabled={m.stock_disponible === 0}>
              {t("pharmacie.medicamentOption", { dci: m.dci, dosage: m.dosage ?? "", stock: m.stock_disponible })}
            </option>
          ))}
        </Select>
      )}

      {substitutions.length > 0 && (
        <div className="rounded-[5px] border border-warning/30 bg-warning-light p-2 text-sm">
          <p className="flex items-center gap-1.5 font-medium text-warning">
            <IconAlertTriangle size={16} />
            {t("pharmacie.rupture")}
          </p>
          <div className="flex flex-wrap gap-2 mt-2">
            {substitutions.map((s) => (
              <Button
                key={s.id}
                type="button"
                variant="outline"
                size="sm"
                onClick={() => chooseSubstitute(s.id)}
              >
                {t("pharmacie.substitutionOption", { dci: s.dci, stock: s.stock_disponible })}
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
          <option value="">{t("pharmacie.selectLotPlaceholder")}</option>
          {lots.map((l) => (
            <option key={l.id} value={l.id}>
              {t("pharmacie.lotOption", {
                numero: l.numero_lot,
                date: l.date_peremption ?? "",
                stock: l.quantite_restante,
              })}
            </option>
          ))}
        </Select>
      )}

      <div className="flex items-center gap-3">
        <Input
          type="number"
          min={1}
          placeholder={t("pharmacie.quantitePlaceholder")}
          value={quantite}
          onChange={(e) => setQuantite(e.target.value)}
          className="w-24"
        />
        <label className="flex items-center gap-2 text-sm text-foreground">
          <input type="checkbox" checked={urgente} onChange={(e) => setUrgente(e.target.checked)} />
          {t("pharmacie.urgentLabel")}
        </label>
        {urgente && <Badge tone="danger">{t("pharmacie.urgentLabel")}</Badge>}
      </div>

      {error && <p className="text-sm text-danger">{error}</p>}
      {confirmation && <p className="text-sm text-success">{confirmation}</p>}

      <div className="flex gap-2">
        <Button
          onClick={handleSubmit}
          disabled={isSubmitting || !medicamentId || !lotId}
        >
          {t("pharmacie.dispense")}
        </Button>
        {onCancel && (
          <Button type="button" variant="light" onClick={onCancel}>
            {t("common.cancel")}
          </Button>
        )}
      </div>
    </div>
  );
}
