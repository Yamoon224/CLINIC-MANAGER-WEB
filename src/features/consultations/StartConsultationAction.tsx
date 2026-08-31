"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { startConsultation } from "./consultations-api";
import { Button, Input } from "@/components/ui";
import { useTranslation } from "@/lib/i18n/LanguageContext";

export function StartConsultationAction({
  patientId,
  onCancel,
}: {
  patientId: number;
  onCancel?: () => void;
}) {
  const { t } = useTranslation();
  const router = useRouter();
  const [motif, setMotif] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleStart() {
    if (!motif.trim()) {
      setError(t("consultations.motifRequired"));
      return;
    }
    setIsSubmitting(true);
    setError(null);
    try {
      const { data } = await startConsultation({ patient_id: patientId, motif });
      router.push(`/consultations/${data.id}`);
    } catch {
      setError(t("consultations.startError"));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <Input
          placeholder={t("consultations.motifPlaceholder")}
          value={motif}
          onChange={(e) => setMotif(e.target.value)}
          className="flex-1"
        />
        <Button onClick={handleStart} disabled={isSubmitting} className="whitespace-nowrap">
          {isSubmitting ? t("consultations.starting") : t("consultations.start")}
        </Button>
      </div>
      {error && (
        <p className="rounded-[5px] bg-danger-light px-3 py-2 text-sm text-danger">{error}</p>
      )}
      {onCancel && (
        <div className="flex justify-end gap-2">
          <Button type="button" variant="light" onClick={onCancel}>
            {t("common.cancel")}
          </Button>
        </div>
      )}
    </div>
  );
}
