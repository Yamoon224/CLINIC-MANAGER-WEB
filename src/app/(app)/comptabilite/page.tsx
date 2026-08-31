"use client";

import { useState } from "react";
import { BaremeIts } from "@/features/comptabilite/BaremeIts";
import { EtatFinancier } from "@/features/comptabilite/EtatFinancier";
import { JournalComptable } from "@/features/comptabilite/JournalComptable";
import { PeriodesPaie } from "@/features/comptabilite/PeriodesPaie";
import { RubriquesPaie } from "@/features/comptabilite/RubriquesPaie";
import { PageHeader, Tabs } from "@/components/ui";
import { useTranslation } from "@/lib/i18n/LanguageContext";

type Tab = "paie" | "rubriques" | "journal" | "etat";

export default function ComptabilitePage() {
  const { t } = useTranslation();
  const [tab, setTab] = useState<Tab>("paie");

  const tabs: { key: Tab; label: string }[] = [
    { key: "paie", label: t("comptabilite.tabs.paie") },
    { key: "rubriques", label: t("comptabilite.tabs.rubriques") },
    { key: "journal", label: t("comptabilite.tabs.journal") },
    { key: "etat", label: t("comptabilite.tabs.etat") },
  ];

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={t("comptabilite.title")}
        description={t("comptabilite.subtitle")}
      />
      <Tabs tabs={tabs} active={tab} onChange={(key) => setTab(key as Tab)} />

      {tab === "paie" && <PeriodesPaie />}
      {tab === "rubriques" && (
        <div className="flex flex-col gap-8">
          <RubriquesPaie />
          <BaremeIts />
        </div>
      )}
      {tab === "journal" && <JournalComptable />}
      {tab === "etat" && <EtatFinancier />}
    </div>
  );
}
