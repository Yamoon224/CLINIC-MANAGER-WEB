"use client";

import { useState } from "react";
import { CampagnesVaccination } from "@/features/vaccinations/CampagnesVaccination";
import { ChaineFroid } from "@/features/vaccinations/ChaineFroid";
import { StockVaccins } from "@/features/vaccinations/StockVaccins";
import { Vaccins } from "@/features/vaccinations/Vaccins";
import { PageHeader, Tabs } from "@/components/ui";
import { useTranslation } from "@/lib/i18n/LanguageContext";

type Tab = "stock" | "vaccins" | "campagnes" | "chaineFroid";

export default function VaccinationsPage() {
  const { t } = useTranslation();
  const [tab, setTab] = useState<Tab>("stock");

  const tabs: { key: Tab; label: string }[] = [
    { key: "stock", label: t("vaccinations.tabs.stock") },
    { key: "vaccins", label: t("vaccinations.tabs.vaccins") },
    { key: "campagnes", label: t("vaccinations.tabs.campagnes") },
    { key: "chaineFroid", label: t("vaccinations.tabs.chaineFroid") },
  ];

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={t("vaccinations.title")}
        description={t("vaccinations.pageSubtitle")}
      />
      <Tabs tabs={tabs} active={tab} onChange={(key) => setTab(key as Tab)} />

      {tab === "stock" && <StockVaccins />}
      {tab === "vaccins" && <Vaccins />}
      {tab === "campagnes" && <CampagnesVaccination />}
      {tab === "chaineFroid" && <ChaineFroid />}
    </div>
  );
}
