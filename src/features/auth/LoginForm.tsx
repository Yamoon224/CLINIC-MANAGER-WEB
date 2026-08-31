"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { useAuth } from "./auth-context";
import { useTranslation } from "@/lib/i18n/LanguageContext";
import { Button, Field, Input, PasswordInput } from "@/components/ui";

export function LoginForm() {
  const { login } = useAuth();
  const { t } = useTranslation();
  const redirectTo = useSearchParams().get("redirect") ?? undefined;
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await login({ email, password }, redirectTo);
    } catch {
      setError(t("auth.invalidCredentials"));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Field label={t("auth.email")}>
        <Input
          id="email"
          type="email"
          required
          autoComplete="email"
          placeholder={t("auth.emailPlaceholder")}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </Field>
      <Field label={t("auth.password")}>
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
        {isSubmitting ? t("auth.loggingIn") : t("auth.login")}
      </Button>
    </form>
  );
}
