"use client";

import { useState } from "react";
import { useAuth } from "./auth-context";
import { Button, Card, Field, Input } from "@/components/ui";

export function ProfilForm() {
  const { user, updateProfile } = useAuth();
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
      setError("Impossible de mettre à jour le profil. Vérifiez les champs.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Card className="max-w-lg">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Field label="Nom complet">
          <Input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </Field>
        <Field label="Email">
          <Input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </Field>
        {error && (
          <p className="rounded-lg bg-danger-light px-3 py-2 text-sm text-danger">
            {error}
          </p>
        )}
        {success && (
          <p className="rounded-lg bg-success-light px-3 py-2 text-sm text-success">
            Profil mis à jour avec succès.
          </p>
        )}
        <Button type="submit" disabled={isSubmitting} className="self-start">
          {isSubmitting ? "Enregistrement..." : "Enregistrer"}
        </Button>
      </form>
    </Card>
  );
}
