import { apiFetch } from "@/lib/api-client";
import type { PaginatedResponse } from "@/lib/pagination";
import type { Service, Ticket } from "./types";

export function orientPatient(
  patientId: number,
  service: Service,
): Promise<{ data: Ticket }> {
  return apiFetch<{ data: Ticket }>(`/patients/${patientId}/tickets`, {
    method: "POST",
    body: JSON.stringify({ service }),
  });
}

export function fetchQueue(
  service?: Service,
  page = 1,
): Promise<PaginatedResponse<Ticket>> {
  const params = new URLSearchParams({ page: String(page) });
  if (service) params.set("service", service);
  return apiFetch<PaginatedResponse<Ticket>>(`/tickets?${params}`);
}

export function callTicket(id: number): Promise<{ data: Ticket }> {
  return apiFetch<{ data: Ticket }>(`/tickets/${id}/appeler`, {
    method: "POST",
  });
}

export function completeTicket(id: number): Promise<{ data: Ticket }> {
  return apiFetch<{ data: Ticket }>(`/tickets/${id}/traiter`, {
    method: "POST",
  });
}
