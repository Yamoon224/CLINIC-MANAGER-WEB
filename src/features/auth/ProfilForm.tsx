"use client";

import { useState } from "react";
import { useAuth } from "./auth-context";
import { Button, Card, Field, Input } from "@/components/ui";
import { useTranslation } from "@/lib/i18n/LanguageContext";

export function ProfilForm() {
  const { user, updateProfile } = useAuth();
  const { t } = useTranslation();
  const [name, setName] = useState(user?.name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setSuccess(false);
    setIsSubmitting(true);
    try {
      await updateProfile({ name, email });
      setSuccess(true);
    } catch {
      setError(t("profil.updateError"));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Card>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Field label={t("profil.fullName")}>
            <Input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </Field>
          <Field label={t("profil.email")}>
            <Input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </Field>
        </div>
        {error && (
          <p className="rounded-lg bg-danger-light px-3 py-2 text-sm text-danger">
            {error}
          </p>
        )}
        {success && (
          <p className="rounded-lg bg-success-light px-3 py-2 text-sm text-success">
            {t("profil.updateSuccess")}
          </p>
        )}
        <Button type="submit" disabled={isSubmitting} className="self-start">
          {isSubmitting ? t("parametres.security.submitting") : t("common.save")}
        </Button>
      </form>
    </Card>
  );
}
