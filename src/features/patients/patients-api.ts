import { apiFetch } from "@/lib/api-client";
import type { PaginatedResponse } from "@/lib/pagination";
import type { Patient, RegisterPatientPayload } from "./types";

export function searchPatients(
  query: string,
  page = 1,
  perPage?: number,
): Promise<PaginatedResponse<Patient>> {
  const params = new URLSearchParams({ page: String(page) });
  if (query) params.set("q", query);
  if (perPage) params.set("per_page", String(perPage));
  return apiFetch<PaginatedResponse<Patient>>(`/patients?${params}`);
}

export function getPatient(id: number): Promise<{ data: Patient }> {
  return apiFetch<{ data: Patient }>(`/patients/${id}`);
}

export function registerPatient(
  payload: RegisterPatientPayload,
): Promise<{ data: Patient }> {
  return apiFetch<{ data: Patient }>("/patients", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function updatePatient(
  id: number,
  payload: RegisterPatientPayload,
): Promise<{ data: Patient }> {
  return apiFetch<{ data: Patient }>(`/patients/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

/**
 * Provisionne l'accès portail du patient — la réception saisit uniquement
 * l'email, le mot de passe temporaire est généré côté serveur et envoyé par
 * SMS/WhatsApp (jamais renvoyé par cette réponse).
 */
export function activerPortailAcces(
  id: number,
  email: string,
): Promise<{ data: Patient }> {
  return apiFetch<{ data: Patient }>(`/patients/${id}/portail/activer`, {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}
