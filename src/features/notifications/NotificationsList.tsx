"use client";

import { useEffect, useState } from "react";
import { Bell, BellRing, type LucideIcon } from "lucide-react";
import * as api from "./notifications-api";
import { emitNotificationsChanged } from "./events";
import type { Notification } from "./types";
import { Badge, Button, Card } from "@/components/ui";
import { useTranslation } from "@/lib/i18n/LanguageContext";

const TONE_BY_TYPE: Record<Notification["type"], "primary" | "success" | "warning" | "danger"> = {
  info: "primary",
  success: "success",
  warning: "warning",
  danger: "danger",
};

function StatCard({
  label,
  value,
  tone,
  icon: Icon,
}: {
  label: string;
  value: number;
  tone: "primary" | "warning";
  icon: LucideIcon;
}) {
  const chipClass =
    tone === "warning" ? "bg-warning-light text-warning" : "bg-primary-light text-primary";
  const valueClass = tone === "warning" ? "text-warning" : "text-primary";
  return (
    <Card className="flex items-start gap-3 p-4">
      <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${chipClass}`}>
        <Icon size={18} />
      </span>
      <div className="min-w-0">
        <div className="text-xs font-medium text-muted">{label}</div>
        <div className={`mt-1 text-2xl font-semibold ${valueClass}`}>{value}</div>
      </div>
    </Card>
  );
}

export function NotificationsList() {
  const { t, locale } = useTranslation();
  const [notifications, setNotifications] = useState<Notification[] | null>(
    null,
  );

  useEffect(() => {
    api.fetchNotifications().then(({ data }) => setNotifications(data));
  }, []);

  async function handleMarkAsRead(id: string) {
    await api.markAsRead(id);
    setNotifications(
      (current) =>
        current?.map((n) => (n.id === id ? { ...n, lue: true } : n)) ?? null,
    );
    emitNotificationsChanged();
  }

  async function handleMarkAllAsRead() {
    await api.markAllAsRead();
    setNotifications(
      (current) => current?.map((n) => ({ ...n, lue: true })) ?? null,
    );
    emitNotificationsChanged();
  }

  const hasUnread = notifications?.some((n) => !n.lue) ?? false;
  const unreadCount = notifications?.filter((n) => !n.lue).length ?? 0;

  return (
    <div className="flex flex-col gap-4">
      {notifications !== null && notifications.length > 0 && (
        <div className="grid grid-cols-2 gap-4 sm:max-w-md">
          <StatCard
            label={t("notifications.statTotal")}
            value={notifications.length}
            tone="primary"
            icon={Bell}
          />
          <StatCard
            label={t("notifications.statNonLues")}
            value={unreadCount}
            tone="warning"
            icon={BellRing}
          />
        </div>
      )}

      <div className="flex justify-end">
        <Button
          variant="outline"
          size="sm"
          disabled={!hasUnread}
          onClick={handleMarkAllAsRead}
        >
          {t("notifications.markAllRead")}
        </Button>
      </div>

      <div className="flex flex-col gap-2">
        {notifications === null && (
          <p className="text-sm text-muted">{t("common.loading")}</p>
        )}
        {notifications?.length === 0 && (
          <Card>
            <p className="text-center text-sm text-muted">
              {t("notifications.empty")}
            </p>
          </Card>
        )}
        {notifications?.map((n) => (
          <Card
            key={n.id}
            className={`flex items-start justify-between gap-4 ${n.lue ? "" : "border-primary/40 bg-primary-light/20"}`}
          >
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <Badge tone={TONE_BY_TYPE[n.type]}>{n.type}</Badge>
                <span className="font-medium">{n.title}</span>
              </div>
              <p className="text-sm text-muted">{n.message}</p>
              <span className="text-xs text-muted">
                {new Date(n.created_at).toLocaleString(
                  locale === "en" ? "en-US" : "fr-FR",
                )}
              </span>
            </div>
            {!n.lue && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleMarkAsRead(n.id)}
              >
                {t("notifications.markRead")}
              </Button>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}
