"use client";

import { useState } from "react";
import { CatalogueAnalyses } from "@/features/laboratoire/CatalogueAnalyses";
import { FeuillesLaboList } from "@/features/laboratoire/FeuillesLaboList";
import { WorkList } from "@/features/laboratoire/WorkList";
import { useAuth } from "@/features/auth/auth-context";
import { PageHeader, Tabs } from "@/components/ui";
import { useTranslation } from "@/lib/i18n/LanguageContext";

type Tab = "workList" | "feuilles" | "catalogue";

export default function LaboratoirePage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [tab, setTab] = useState<Tab>("workList");

  const canEdit =
    user?.roles.includes("technicien-labo") ||
    user?.roles.includes("administrateur") ||
    false;

  const tabs: { key: Tab; label: string }[] = [
    { key: "workList", label: t("laboratoire.tabs.workList") },
    { key: "feuilles", label: t("laboratoire.tabs.feuilles") },
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
      {tab === "feuilles" && <FeuillesLaboList canEdit={canEdit} />}
      {tab === "catalogue" && <CatalogueAnalyses />}
    </div>
  );
}
