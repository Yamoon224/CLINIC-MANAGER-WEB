"use client";

import { useEffect, useState } from "react";
import { IconCircleCheck } from "@tabler/icons-react";
import { Button, Select } from "@/components/ui";
import { useTranslation } from "@/lib/i18n/LanguageContext";
import { fetchServices, orientPatient } from "./queue-api";
import { FALLBACK_SERVICES, type ServiceRef } from "./types";

export function OrientPatientAction({
  patientId,
  onCancel,
}: {
  patientId: number;
  onCancel?: () => void;
}) {
  const { t } = useTranslation();
  const [services, setServices] = useState<ServiceRef[]>(FALLBACK_SERVICES);
  const [service, setService] = useState<string>(FALLBACK_SERVICES[0].code);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [ticketLabel, setTicketLabel] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchServices()
      .then((res) => {
        if (res.data.length === 0) return;
        setServices(res.data);
        setService(res.data[0].code);
      })
      .catch(() => {
        /* on garde la liste de repli */
      });
  }, []);

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
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <Select
          value={service}
          onChange={(e) => setService(e.target.value)}
          className="flex-1"
        >
          {services.map((s) => (
            <option key={s.code} value={s.code}>
              {s.nom}
            </option>
          ))}
        </Select>
        <Button onClick={handleOrient} disabled={isSubmitting} className="whitespace-nowrap">
          {isSubmitting ? t("queue.orient.submitting") : t("queue.orient.submit")}
        </Button>
      </div>
      {ticketLabel && (
        <p className="flex items-center gap-1.5 rounded-[5px] bg-success-light px-3 py-2 text-sm text-success">
          <IconCircleCheck size={16} className="shrink-0" />
          {t("queue.orient.createdPrefix")}
          <span className="font-semibold">{ticketLabel}</span>
        </p>
      )}
      {error && <p className="text-sm text-danger">{error}</p>}
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
