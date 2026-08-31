"use client";

import { useState } from "react";
import { usePortailAuth } from "./portail-auth-context";
import { useTranslation } from "@/lib/i18n/LanguageContext";
import { Button, Field, Input, PasswordInput } from "@/components/ui";

export function PortailLoginForm() {
  const { login } = usePortailAuth();
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await login({ email, password });
    } catch {
      setError(t("portail.login.invalidCredentials"));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Field label={t("portail.login.email")}>
        <Input
          id="email"
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </Field>
      <Field label={t("portail.login.password")}>
        <PasswordInput
          id="password"
          required
          autoComplete="current-password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </Field>
      {error && (
        <p className="rounded-[5px] bg-danger-light px-3 py-2 text-sm text-danger">
          {error}
        </p>
      )}
      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? t("portail.login.submitting") : t("portail.login.submit")}
      </Button>
    </form>
  );
}
