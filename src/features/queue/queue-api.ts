import { apiFetch } from "@/lib/api-client";
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

export function fetchQueue(service?: Service): Promise<{ data: Ticket[] }> {
  const params = service ? `?service=${service}` : "";
  return apiFetch<{ data: Ticket[] }>(`/tickets${params}`);
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
