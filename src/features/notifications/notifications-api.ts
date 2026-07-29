import { apiFetch } from "@/lib/api-client";
import type { Notification } from "./types";

export function fetchNotifications(): Promise<{ data: Notification[] }> {
  return apiFetch<{ data: Notification[] }>("/notifications");
}

export function fetchUnreadCount(): Promise<{ count: number }> {
  return apiFetch<{ count: number }>("/notifications/non-lues");
}

export function markAsRead(id: string): Promise<{ data: Notification }> {
  return apiFetch<{ data: Notification }>(`/notifications/${id}/lue`, {
    method: "POST",
  });
}

export function markAllAsRead(): Promise<void> {
  return apiFetch<void>("/notifications/tout-marquer-lu", { method: "POST" });
}
