"use client";

import { useState } from "react";
import { useAuth } from "@/features/auth/auth-context";
import { ChangePasswordForm } from "@/features/auth/ChangePasswordForm";
import { DisplayPreferences } from "@/features/auth/DisplayPreferences";
import { UserAdmin } from "@/features/administration/UserAdmin";
import { PageHeader } from "@/components/ui";

type Tab = "securite" | "affichage" | "administration";

export default function ParametresPage() {
  const { user } = useAuth();
  const isAdmin = user?.roles.includes("administrateur") ?? false;
  const [tab, setTab] = useState<Tab>("securite");

  const tabs: { id: Tab; label: string }[] = [
    { id: "securite", label: "Sécurité" },
    { id: "affichage", label: "Affichage" },
    ...(isAdmin
      ? [{ id: "administration" as const, label: "Administration" }]
      : []),
  ];

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Paramètres"
        description="Sécurité du compte, affichage et administration système."
      />
      <div className="flex gap-1 border-b border-border">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              tab === t.id
                ? "border-b-2 border-primary text-primary"
                : "text-muted hover:text-foreground"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "securite" && <ChangePasswordForm />}
      {tab === "affichage" && <DisplayPreferences />}
      {tab === "administration" && isAdmin && <UserAdmin />}
    </div>
  );
}
