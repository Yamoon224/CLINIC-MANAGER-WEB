"use client";

import { useState } from "react";
import { useAuth } from "@/features/auth/auth-context";
import { ChangePasswordForm } from "@/features/auth/ChangePasswordForm";
import { DisplayPreferences } from "@/features/auth/DisplayPreferences";
import { UserAdmin } from "@/features/administration/UserAdmin";
import { PageHeader } from "@/components/ui";
import { useTranslation } from "@/lib/i18n/LanguageContext";

type Tab = "securite" | "affichage" | "administration";

export default function ParametresPage() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const isAdmin = user?.roles.includes("administrateur") ?? false;
  const [tab, setTab] = useState<Tab>("securite");

  const tabs: Tab[] = [
    "securite",
    "affichage",
    ...(isAdmin ? (["administration"] as const) : []),
  ];

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={t("parametres.title")}
        description={t("parametres.subtitle")}
      />
      <div className="flex gap-1 border-b border-border">
        {tabs.map((tabId) => (
          <button
            key={tabId}
            onClick={() => setTab(tabId)}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              tab === tabId
                ? "border-b-2 border-primary text-primary"
                : "text-muted hover:text-foreground"
            }`}
          >
            {t(`parametres.tabs.${tabId}`)}
          </button>
        ))}
      </div>

      {tab === "securite" && <ChangePasswordForm />}
      {tab === "affichage" && <DisplayPreferences />}
      {tab === "administration" && isAdmin && <UserAdmin />}
    </div>
  );
}
