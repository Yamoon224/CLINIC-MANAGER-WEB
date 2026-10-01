"use client";

import { useSyncExternalStore } from "react";
import { ConsultationsDentaires } from "@/features/dentaire/ConsultationsDentaires";
import { GrilleTarifaire } from "@/features/dentaire/GrilleTarifaire";
import { OrdonnancesDentaires } from "@/features/dentaire/OrdonnancesDentaires";
import { TraitementsDentaires } from "@/features/dentaire/TraitementsDentaires";
import { PageHeader, Tabs } from "@/components/ui";
import { useTranslation } from "@/lib/i18n/LanguageContext";

const TABS = ["consultations", "traitements", "ordonnances", "grille"] as const;
type Tab = (typeof TABS)[number];

function isTab(value: string): value is Tab {
  return (TABS as readonly string[]).includes(value);
}

function subscribeToHash(onChange: () => void): () => void {
  window.addEventListener("hashchange", onChange);
  return () => window.removeEventListener("hashchange", onChange);
}

export default function DentairePage() {
  const { t } = useTranslation();

  // L'onglet actif est l'ancre de l'URL (#traitements…) : le retour depuis la
  // fiche d'un traitement rouvre ainsi la liste des traitements.
  const hash = useSyncExternalStore(
    subscribeToHash,
    () => window.location.hash.slice(1),
    () => "",
  );
  const tab: Tab = isTab(hash) ? hash : "consultations";

  function changeTab(key: string) {
    window.location.replace(`#${key}`);
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title={t("dentaire.title")} description={t("dentaire.pageSubtitle")} />
      <Tabs
        tabs={TABS.map((key) => ({ key, label: t(`dentaire.tabs.${key}`) }))}
        active={tab}
        onChange={changeTab}
      />

      {tab === "consultations" && <ConsultationsDentaires />}
      {tab === "traitements" && <TraitementsDentaires />}
      {tab === "ordonnances" && <OrdonnancesDentaires />}
      {tab === "grille" && <GrilleTarifaire />}
    </div>
  );
}
