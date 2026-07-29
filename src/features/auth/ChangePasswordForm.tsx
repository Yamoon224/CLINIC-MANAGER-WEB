"use client";

import { useState } from "react";
import * as authApi from "./auth-api";
import { Button, Card, Field, PasswordInput } from "@/components/ui";

export function ChangePasswordForm() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setSuccess(false);
    setIsSubmitting(true);
    try {
      await authApi.changePassword({
        current_password: currentPassword,
        password,
        password_confirmation: passwordConfirmation,
      });
      setSuccess(true);
      setCurrentPassword("");
      setPassword("");
      setPasswordConfirmation("");
    } catch {
      setError(
        "Impossible de changer le mot de passe. Vérifiez le mot de passe actuel et que les deux nouveaux mots de passe correspondent.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Card className="max-w-lg">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Field label="Mot de passe actuel">
          <PasswordInput
            required
            autoComplete="current-password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
          />
        </Field>
        <Field label="Nouveau mot de passe">
          <PasswordInput
            required
            autoComplete="new-password"
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </Field>
        <Field label="Confirmer le nouveau mot de passe">
          <PasswordInput
            required
            autoComplete="new-password"
            minLength={8}
            value={passwordConfirmation}
            onChange={(e) => setPasswordConfirmation(e.target.value)}
          />
        </Field>
        {error && (
          <p className="rounded-lg bg-danger-light px-3 py-2 text-sm text-danger">
            {error}
          </p>
        )}
        {success && (
          <p className="rounded-lg bg-success-light px-3 py-2 text-sm text-success">
            Mot de passe changé avec succès.
          </p>
        )}
        <Button type="submit" disabled={isSubmitting} className="self-start">
          {isSubmitting ? "Enregistrement..." : "Changer le mot de passe"}
        </Button>
      </form>
    </Card>
  );
}
