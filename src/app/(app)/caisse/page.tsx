"use client";

import { useState } from "react";
import { Creances } from "@/features/caisse/Creances";
import { Depenses } from "@/features/caisse/Depenses";
import { SessionCaisseWidget } from "@/features/caisse/SessionCaisseWidget";
import { SessionsCaisseAdmin } from "@/features/caisse/SessionsCaisseAdmin";
import { PageHeader, Tabs } from "@/components/ui";
import { useTranslation } from "@/lib/i18n/LanguageContext";

type Tab = "session" | "creances" | "depenses";

export default function CaissePage() {
  const { t } = useTranslation();
  const [tab, setTab] = useState<Tab>("session");

  const tabs: { key: Tab; label: string }[] = [
    { key: "session", label: t("caisse.tabs.session") },
    { key: "creances", label: t("caisse.tabs.creances") },
    { key: "depenses", label: t("caisse.tabs.depenses") },
  ];

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title={t("nav.caisse")} description={t("caisse.pageSubtitle")} />
      <Tabs tabs={tabs} active={tab} onChange={(key) => setTab(key as Tab)} />

      {tab === "session" && (
        <div className="flex flex-col gap-6">
          <SessionCaisseWidget />
          <SessionsCaisseAdmin />
        </div>
      )}
      {tab === "creances" && <Creances />}
      {tab === "depenses" && <Depenses />}
    </div>
  );
}
