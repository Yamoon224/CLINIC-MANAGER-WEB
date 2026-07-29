import { PageHeader } from "@/components/ui";
import { NotificationsList } from "@/features/notifications/NotificationsList";

export default function NotificationsPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Notifications"
        description="Toutes vos notifications récentes."
      />
      <NotificationsList />
    </div>
  );
}
