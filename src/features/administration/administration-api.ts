import { apiFetch } from "@/lib/api-client";
import type {
  AdminUser,
  AuditCauser,
  AuditEntry,
  AuditFilters,
  CreateUserPayload,
  DashboardStats,
  PaginatedResponse,
} from "./types";

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

export function fetchUsers(
  page = 1,
  perPage = 20,
  q = "",
): Promise<PaginatedResponse<AdminUser>> {
  const params = new URLSearchParams({
    page: String(page),
    per_page: String(perPage),
  });
  if (q) params.set("q", q);
  return apiFetch<PaginatedResponse<AdminUser>>(`/utilisateurs?${params}`);
}

export function fetchRoles(): Promise<{ data: string[] }> {
  return apiFetch<{ data: string[] }>("/roles");
}

export function createUser(payload: CreateUserPayload): Promise<{ data: AdminUser }> {
  return apiFetch<{ data: AdminUser }>("/utilisateurs", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function changeUserRole(
  userId: number,
  role: string,
): Promise<{ data: AdminUser }> {
  return apiFetch<{ data: AdminUser }>(`/utilisateurs/${userId}/role`, {
    method: "PATCH",
    body: JSON.stringify({ role }),
  });
}

export function changeUserStatus(
  userId: number,
  isActive: boolean,
): Promise<{ data: AdminUser }> {
  return apiFetch<{ data: AdminUser }>(`/utilisateurs/${userId}/statut`, {
    method: "PATCH",
    body: JSON.stringify({ is_active: isActive }),
  });
}
