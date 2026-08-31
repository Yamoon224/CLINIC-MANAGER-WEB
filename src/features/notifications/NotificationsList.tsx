"use client";

import { useEffect, useState } from "react";
import { IconBell, IconBellRinging } from "@tabler/icons-react";
import * as api from "./notifications-api";
import { emitNotificationsChanged } from "./events";
import type { Notification } from "./types";
import { Badge, Button, Card, StatCard, type Tone } from "@/components/ui";
import { cn } from "@/lib/cn";
import { useTranslation } from "@/lib/i18n/LanguageContext";

const TONE_BY_TYPE: Record<Notification["type"], Tone> = {
  info: "primary",
  success: "success",
  warning: "warning",
  danger: "danger",
};

export function NotificationsList() {
  const { t, locale } = useTranslation();
  const [notifications, setNotifications] = useState<Notification[] | null>(null);

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
      <div className="grid grid-cols-2 gap-4 sm:max-w-md">
        <StatCard
          label={t("notifications.statTotal")}
          value={notifications?.length ?? 0}
          tone="primary"
          icon={<IconBell size={18} />}
        />
        <StatCard
          label={t("notifications.statNonLues")}
          value={unreadCount}
          tone="warning"
          icon={<IconBellRinging size={18} />}
        />
      </div>

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
            className={cn(
              "flex items-start justify-between gap-4",
              !n.lue && "border-primary/40 bg-primary-light/40",
            )}
          >
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <Badge tone={TONE_BY_TYPE[n.type]} border>
                  {n.type}
                </Badge>
                <span className="font-semibold text-heading">{n.title}</span>
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
                variant="outline"
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
