import { apiFetch } from "@/lib/api-client";
import type { AuditCauser, AuditEntry, AuditFilters, DashboardStats, PaginatedResponse } from "./types";

export function fetchDashboard(): Promise<{ data: DashboardStats }> {
  return apiFetch<{ data: DashboardStats }>("/statistiques");
}

export function fetchAudit(
  filters: AuditFilters,
  page = 1,
): Promise<PaginatedResponse<AuditEntry>> {
  const params = new URLSearchParams();
  if (filters.subject_type) params.set("subject_type", filters.subject_type);
  if (filters.causer_id) params.set("causer_id", String(filters.causer_id));
  if (filters.event) params.set("event", filters.event);
  if (filters.date_debut) params.set("date_debut", filters.date_debut);
  if (filters.date_fin) params.set("date_fin", filters.date_fin);
  params.set("page", String(page));

  return apiFetch<PaginatedResponse<AuditEntry>>(`/audit?${params.toString()}`);
}

export function fetchCausers(): Promise<{ data: AuditCauser[] }> {
  return apiFetch<{ data: AuditCauser[] }>("/audit/causers");
}
