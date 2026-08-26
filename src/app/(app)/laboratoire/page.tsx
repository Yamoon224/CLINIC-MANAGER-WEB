"use client";

import { WorkList } from "@/features/laboratoire/WorkList";
import { PageHeader } from "@/components/ui";
import { useTranslation } from "@/lib/i18n/LanguageContext";

export default function LaboratoirePage() {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title={t("laboratoire.pageTitle")} description={t("laboratoire.pageSubtitle")} />
      <WorkList />
    </div>
  );
}
