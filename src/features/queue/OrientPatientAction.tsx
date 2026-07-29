"use client";

import { useState } from "react";
import { Button, Card, Select } from "@/components/ui";
import { useTranslation } from "@/lib/i18n/LanguageContext";
import { orientPatient } from "./queue-api";
import { SERVICES, type Service } from "./types";

export function OrientPatientAction({ patientId }: { patientId: number }) {
  const { t } = useTranslation();
  const [service, setService] = useState<Service>(SERVICES[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [ticketLabel, setTicketLabel] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleOrient() {
    setIsSubmitting(true);
    setError(null);
    try {
      const { data } = await orientPatient(patientId, service);
      setTicketLabel(data.label);
    } catch {
      setError(t("queue.orient.error"));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Card className="flex flex-col gap-2 max-w-md">
      <span className="font-semibold text-sm text-foreground">{t("queue.orient.title")}</span>
      <div className="flex items-center gap-2">
        <Select
          value={service}
          onChange={(e) => setService(e.target.value as Service)}
          className="flex-1"
        >
          {SERVICES.map((s) => (
            <option key={s} value={s}>
              {t(`queue.service.${s}`)}
            </option>
          ))}
        </Select>
        <Button onClick={handleOrient} disabled={isSubmitting} className="whitespace-nowrap">
          {isSubmitting ? t("queue.orient.submitting") : t("queue.orient.submit")}
        </Button>
      </div>
      {ticketLabel && (
        <p className="text-sm text-success">
          {t("queue.orient.createdPrefix")}
          <span className="font-semibold">{ticketLabel}</span>
        </p>
      )}
      {error && <p className="text-sm text-danger">{error}</p>}
    </Card>
  );
}
