"use client";

import { useState } from "react";
import { Bordereaux } from "@/features/assurances/Bordereaux";
import { CompagniesAssurance } from "@/features/assurances/CompagniesAssurance";
import { PrisesEnCharge } from "@/features/assurances/PrisesEnCharge";
import { Tabs } from "@/components/ui";
import { useTranslation } from "@/lib/i18n/LanguageContext";

type Tab = "compagnies" | "prisesEnCharge" | "bordereaux";

export default function AssurancesPage() {
  const { t } = useTranslation();
  const [tab, setTab] = useState<Tab>("compagnies");

  const tabs: { key: Tab; label: string }[] = [
    { key: "compagnies", label: t("assurances.tabs.compagnies") },
    { key: "prisesEnCharge", label: t("assurances.tabs.prisesEnCharge") },
    { key: "bordereaux", label: t("assurances.tabs.bordereaux") },
  ];

  return (
    <div className="flex flex-col gap-6">
      <Tabs tabs={tabs} active={tab} onChange={(key) => setTab(key as Tab)} />

      {tab === "compagnies" && <CompagniesAssurance />}
      {tab === "prisesEnCharge" && <PrisesEnCharge />}
      {tab === "bordereaux" && <Bordereaux />}
    </div>
  );
}
