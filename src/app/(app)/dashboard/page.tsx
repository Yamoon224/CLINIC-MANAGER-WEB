"use client";

import { Dashboard } from "@/features/administration/Dashboard";
import { useTranslation } from "@/lib/i18n/LanguageContext";

export default function DashboardPage() {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-lg font-semibold">{t("dashboard.title")}</h1>
      <Dashboard />
    </div>
  );
}
