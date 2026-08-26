"use client";

import { Audit } from "@/features/administration/Audit";
import { PageHeader } from "@/components/ui";
import { useTranslation } from "@/lib/i18n/LanguageContext";

export default function AuditPage() {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title={t("audit.title")} description={t("audit.subtitle")} />
      <Audit />
    </div>
  );
}
