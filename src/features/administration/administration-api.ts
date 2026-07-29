import { apiFetch } from "@/lib/api-client";
import type { DashboardStats } from "./types";

export function fetchDashboard(): Promise<{ data: DashboardStats }> {
  return apiFetch<{ data: DashboardStats }>("/statistiques");
}
