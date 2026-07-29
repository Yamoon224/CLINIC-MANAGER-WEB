"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { Bell } from "lucide-react";
import {
  fetchNotifications,
  fetchUnreadCount,
  markAsRead,
} from "@/features/notifications/notifications-api";
import { emitNotificationsChanged, onNotificationsChanged } from "@/features/notifications/events";
import type { Notification } from "@/features/notifications/types";
import { useClickOutside } from "@/lib/useClickOutside";
import { useTranslation } from "@/lib/i18n/LanguageContext";

export function NotificationBell() {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState<Notification[] | null>(
    null,
  );
  const ref = useRef<HTMLDivElement>(null);
  useClickOutside(ref, () => setOpen(false));

  const refreshUnreadCount = useCallback(async () => {
    try {
      const { count } = await fetchUnreadCount();
      setUnreadCount(count);
    } catch {
      // silencieux : le badge reste simplement à sa dernière valeur connue
    }
  }, []);

  useEffect(() => {
    refreshUnreadCount();
    const interval = setInterval(refreshUnreadCount, 60_000);
    return () => clearInterval(interval);
  }, [refreshUnreadCount]);

  useEffect(() => {
    return onNotificationsChanged(() => {
      refreshUnreadCount();
      setNotifications(null);
    });
  }, [refreshUnreadCount]);

  async function handleOpen() {
    const willOpen = !open;
    setOpen(willOpen);
    if (willOpen && !notifications) {
      const { data } = await fetchNotifications();
      setNotifications(data);
    }
  }

  async function handleMarkAsRead(id: string) {
    await markAsRead(id);
    setNotifications(
      (current) =>
        current?.map((n) => (n.id === id ? { ...n, lue: true } : n)) ?? null,
    );
    setUnreadCount((c) => Math.max(0, c - 1));
    emitNotificationsChanged();
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={handleOpen}
        aria-label={t("nav.notifications")}
        className="relative rounded-full p-2 text-muted hover:bg-primary-light hover:text-primary"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-danger px-1 text-[10px] font-semibold text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>
      {open && (
        <div className="absolute right-0 z-40 mt-2 w-80 rounded-xl border border-border bg-surface shadow-lg">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <span className="text-sm font-semibold">
              {t("nav.notifications")}
            </span>
            <Link
              href="/notifications"
              onClick={() => setOpen(false)}
              className="text-xs font-medium text-primary hover:underline"
            >
              {t("notifications.seeAll")}
            </Link>
          </div>
          <div className="max-h-80 overflow-y-auto">
            {notifications === null && (
              <p className="px-4 py-6 text-center text-sm text-muted">
                {t("common.loading")}
              </p>
            )}
            {notifications?.length === 0 && (
              <p className="px-4 py-6 text-center text-sm text-muted">
                {t("notifications.emptyShort")}
              </p>
            )}
            {notifications?.slice(0, 6).map((n) => (
              <button
                key={n.id}
                onClick={() => !n.lue && handleMarkAsRead(n.id)}
                className={`flex w-full flex-col gap-0.5 border-b border-border px-4 py-3 text-left text-sm last:border-0 hover:bg-primary-light/40 ${
                  n.lue ? "" : "bg-primary-light/20"
                }`}
              >
                <span className="font-medium text-foreground">
                  {n.title}
                </span>
                <span className="text-xs text-muted">{n.message}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
