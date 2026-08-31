"use client";

import { useState } from "react";
import { useAuth } from "@/features/auth/auth-context";
import { ChangePasswordForm } from "@/features/auth/ChangePasswordForm";
import { DisplayPreferences } from "@/features/auth/DisplayPreferences";
import { UserAdmin } from "@/features/administration/UserAdmin";
import { ServicesAdmin } from "@/features/administration/ServicesAdmin";
import { PageHeader, Tabs } from "@/components/ui";
import { useTranslation } from "@/lib/i18n/LanguageContext";

type Tab = "securite" | "affichage" | "administration" | "services";

export default function ParametresPage() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const isAdmin = user?.roles.includes("administrateur") ?? false;
  const [tab, setTab] = useState<Tab>("securite");

  const tabIds: Tab[] = [
    "securite",
    "affichage",
    ...(isAdmin ? (["administration", "services"] as const) : []),
  ];
  const tabs = tabIds.map((tabId) => ({ key: tabId, label: t(`parametres.tabs.${tabId}`) }));

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={t("parametres.title")}
        description={t("parametres.subtitle")}
      />
      <Tabs tabs={tabs} active={tab} onChange={(key) => setTab(key as Tab)} />

      {tab === "securite" && <ChangePasswordForm />}
      {tab === "affichage" && <DisplayPreferences />}
      {tab === "administration" && isAdmin && <UserAdmin />}
      {tab === "services" && isAdmin && <ServicesAdmin />}
    </div>
  );
}
