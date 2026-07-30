"use client";

import { useEffect, useState } from "react";
import { createDemandes, fetchAnalyseTypes } from "./laboratoire-api";
import type { AnalyseType } from "./types";
import { Button } from "@/components/ui";
import { useTranslation } from "@/lib/i18n/LanguageContext";

export function DemandeAnalysesAction({
  patientId,
  onCreated,
  onCancel,
}: {
  patientId: number;
  onCreated?: () => void;
  onCancel?: () => void;
}) {
  const { t } = useTranslation();
  const [analyseTypes, setAnalyseTypes] = useState<AnalyseType[]>([]);
  const [selected, setSelected] = useState<number[]>([]);
  const [urgente, setUrgente] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmation, setConfirmation] = useState<string | null>(null);

  useEffect(() => {
    fetchAnalyseTypes().then((res) => setAnalyseTypes(res.data));
  }, []);

  function toggle(id: number) {
    setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
  }

  async function handleSubmit() {
    if (selected.length === 0) return;
    setIsSubmitting(true);
    try {
      await createDemandes(patientId, { analyse_type_ids: selected, urgente });
      setConfirmation(t("laboratoire.sentConfirmation", { count: selected.length }));
      setSelected([]);
      setUrgente(false);
      onCreated?.();
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-col gap-1 max-h-40 overflow-y-auto text-sm">
        {analyseTypes.map((a) => (
          <label key={a.id} className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={selected.includes(a.id)}
              onChange={() => toggle(a.id)}
            />
            {a.nom}
          </label>
        ))}
      </div>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={urgente} onChange={(e) => setUrgente(e.target.checked)} />
        {t("laboratoire.urgentLabel")}
      </label>
      <div className="flex gap-2">
        <Button
          onClick={handleSubmit}
          disabled={isSubmitting || selected.length === 0}
        >
          {t("laboratoire.send")}
        </Button>
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            {t("common.cancel")}
          </Button>
        )}
      </div>
      {confirmation && <p className="text-sm text-success">{confirmation}</p>}
    </div>
  );
}
