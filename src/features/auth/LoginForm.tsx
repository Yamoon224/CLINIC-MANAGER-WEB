"use client";

import { useState } from "react";
import { useAuth } from "./auth-context";
import { Button, Field, Input } from "@/components/ui";

export function LoginForm() {
  const { login } = useAuth();
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
      setError("Identifiants invalides.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Field label="Email">
        <Input
          id="email"
          type="email"
          required
          autoComplete="email"
          placeholder="vous@clinique.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </Field>
      <Field label="Mot de passe">
        <Input
          id="password"
          type="password"
          required
          autoComplete="current-password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </Field>
      {error && (
        <p className="rounded-lg bg-danger-light px-3 py-2 text-sm text-danger">
          {error}
        </p>
      )}
      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? "Connexion..." : "Se connecter"}
      </Button>
    </form>
  );
}
