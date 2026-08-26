"use client";

import { useState } from "react";
import { ChaineFroid } from "@/features/vaccinations/ChaineFroid";
import { StockVaccins } from "@/features/vaccinations/StockVaccins";
import { PageHeader, Tabs } from "@/components/ui";
import { useTranslation } from "@/lib/i18n/LanguageContext";

type Tab = "stock" | "chaineFroid";

export default function VaccinationsPage() {
  const { t } = useTranslation();
  const [tab, setTab] = useState<Tab>("stock");

  const tabs: { key: Tab; label: string }[] = [
    { key: "stock", label: t("vaccinations.tabs.stock") },
    { key: "chaineFroid", label: t("vaccinations.tabs.chaineFroid") },
  ];

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title={t("vaccinations.title")} description={t("vaccinations.pageSubtitle")} />
      <Tabs tabs={tabs} active={tab} onChange={(key) => setTab(key as Tab)} />

      {tab === "stock" && <StockVaccins />}
      {tab === "chaineFroid" && <ChaineFroid />}
    </div>
  );
}
