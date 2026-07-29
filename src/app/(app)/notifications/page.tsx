"use client";

import { PageHeader } from "@/components/ui";
import { NotificationsList } from "@/features/notifications/NotificationsList";
import { useTranslation } from "@/lib/i18n/LanguageContext";

export default function NotificationsPage() {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={t("notifications.title")}
        description={t("notifications.subtitle")}
      />
      <NotificationsList />
    </div>
  );
}
