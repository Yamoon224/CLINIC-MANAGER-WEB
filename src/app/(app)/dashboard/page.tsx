"use client";

import { Dashboard } from "@/features/administration/Dashboard";
import { PageHeader } from "@/components/ui";
import { useTranslation } from "@/lib/i18n/LanguageContext";

export default function DashboardPage() {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col gap-5">
      <PageHeader title={t("dashboard.title")} />
      <Dashboard />
    </div>
  );
}
