"use client";

import { useState } from "react";
import { activerPortailAcces } from "@/features/patients/patients-api";
import type { Patient } from "@/features/patients/types";
import { Badge, Button, Field, Input, Modal } from "@/components/ui";
import { useTranslation } from "@/lib/i18n/LanguageContext";

/**
 * Action côté réception pour provisionner l'accès portail d'un patient
 * (jamais d'auto-inscription — choix confirmé du cahier des charges). Le
 * mot de passe temporaire n'est ni affiché ni stocké ici : il part
 * directement par SMS/WhatsApp au patient (PortailAuthService::activerAcces).
 */
export function ActivatePortailAccess({
  patient,
  onUpdated,
}: {
  patient: Patient;
  onUpdated: (patient: Patient) => void;
}) {
  const { t, locale } = useTranslation();
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState(patient.portail_email ?? "");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isActive = Boolean(patient.portail_active_at);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      const { data } = await activerPortailAcces(patient.id, email);
      onUpdated(data);
      setOpen(false);
    } catch {
      setError(t("patients.detail.portail.error"));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      <div className="flex items-center gap-2">
        <Button variant="secondary" onClick={() => setOpen(true)}>
          {isActive
            ? t("patients.detail.portail.reactivate")
            : t("patients.detail.portail.activate")}
        </Button>
        {isActive && (
          <Badge tone="success">
            {t("patients.detail.portail.activeSince", {
              date: new Date(patient.portail_active_at as string).toLocaleDateString(
                locale === "en" ? "en-US" : "fr-FR",
              ),
            })}
          </Badge>
        )}
      </div>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={t("patients.detail.portail.modalTitle")}
        size="sm"
      >
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <p className="text-sm text-muted">{t("patients.detail.portail.modalHelp")}</p>
          <Field label={t("patients.detail.portail.email")}>
            <Input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </Field>
          {error && (
            <p className="rounded-[5px] bg-danger-light px-3 py-2 text-sm text-danger">{error}</p>
          )}
          <div className="flex gap-2">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting
                ? t("patients.detail.portail.submitting")
                : t("patients.detail.portail.submit")}
            </Button>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              {t("common.cancel")}
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
