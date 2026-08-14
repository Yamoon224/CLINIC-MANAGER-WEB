"use client";

import { useState } from "react";
import { AlertesStock } from "@/features/pharmacie/AlertesStock";
import { PrescriptionsEnAttente } from "@/features/pharmacie/PrescriptionsEnAttente";
import { StockMedicaments } from "@/features/pharmacie/StockMedicaments";
import { Tabs } from "@/components/ui";
import { useTranslation } from "@/lib/i18n/LanguageContext";

type Tab = "stock" | "alertes" | "enAttente";

export default function PharmaciePage() {
  const { t } = useTranslation();
  const [tab, setTab] = useState<Tab>("stock");

  const tabs: { key: Tab; label: string }[] = [
    { key: "stock", label: t("pharmacie.tabs.stock") },
    { key: "alertes", label: t("pharmacie.tabs.alertes") },
    { key: "enAttente", label: t("pharmacie.tabs.enAttente") },
  ];

  return (
    <div className="flex flex-col gap-6">
      <Tabs tabs={tabs} active={tab} onChange={(key) => setTab(key as Tab)} />

      {tab === "stock" && <StockMedicaments />}
      {tab === "alertes" && <AlertesStock />}
      {tab === "enAttente" && <PrescriptionsEnAttente />}
    </div>
  );
}
