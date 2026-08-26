"use client";

import { useState } from "react";
import { Conges } from "@/features/personnel/Conges";
import { Employes } from "@/features/personnel/Employes";
import { Planning } from "@/features/personnel/Planning";
import { PageHeader, Tabs } from "@/components/ui";
import { useTranslation } from "@/lib/i18n/LanguageContext";

type Tab = "employes" | "conges" | "planning";

export default function PersonnelPage() {
  const { t } = useTranslation();
  const [tab, setTab] = useState<Tab>("employes");

  const tabs: { key: Tab; label: string }[] = [
    { key: "employes", label: t("personnel.tabs.employes") },
    { key: "conges", label: t("personnel.tabs.conges") },
    { key: "planning", label: t("personnel.tabs.planning") },
  ];

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title={t("personnel.title")} description={t("personnel.subtitle")} />
      <Tabs tabs={tabs} active={tab} onChange={(key) => setTab(key as Tab)} />

      {tab === "employes" && <Employes />}
      {tab === "conges" && <Conges />}
      {tab === "planning" && <Planning />}
    </div>
  );
}
