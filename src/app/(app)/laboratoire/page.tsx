"use client";

import { useState } from "react";
import { CatalogueAnalyses } from "@/features/laboratoire/CatalogueAnalyses";
import { WorkList } from "@/features/laboratoire/WorkList";
import { PageHeader, Tabs } from "@/components/ui";
import { useTranslation } from "@/lib/i18n/LanguageContext";

type Tab = "workList" | "catalogue";

export default function LaboratoirePage() {
  const { t } = useTranslation();
  const [tab, setTab] = useState<Tab>("workList");

  const tabs: { key: Tab; label: string }[] = [
    { key: "workList", label: t("laboratoire.tabs.workList") },
    { key: "catalogue", label: t("laboratoire.tabs.catalogue") },
  ];

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={t("laboratoire.pageTitle")}
        description={t("laboratoire.pageSubtitle")}
      />
      <Tabs tabs={tabs} active={tab} onChange={(key) => setTab(key as Tab)} />

      {tab === "workList" && <WorkList />}
      {tab === "catalogue" && <CatalogueAnalyses />}
    </div>
  );
}
