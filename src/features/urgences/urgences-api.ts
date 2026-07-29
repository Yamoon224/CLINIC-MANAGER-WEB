import { apiFetch } from "@/lib/api-client";
import type { PaginatedResponse } from "@/lib/pagination";
import type {
  AdmettreUrgencePayload,
  AdmissionUrgence,
  IssueUrgence,
  NiveauTriage,
} from "./types";

export function admettre(
  payload: AdmettreUrgencePayload,
): Promise<{ data: AdmissionUrgence }> {
  return apiFetch<{ data: AdmissionUrgence }>("/urgences", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function fetchFileAttente(
  page = 1,
): Promise<PaginatedResponse<AdmissionUrgence>> {
  const params = new URLSearchParams({ page: String(page) });
  return apiFetch<PaginatedResponse<AdmissionUrgence>>(`/urgences?${params}`);
}

export function getAdmission(id: number): Promise<{ data: AdmissionUrgence }> {
  return apiFetch<{ data: AdmissionUrgence }>(`/urgences/${id}`);
}

export function trier(
  id: number,
  niveau_triage: NiveauTriage,
): Promise<{ data: AdmissionUrgence }> {
  return apiFetch<{ data: AdmissionUrgence }>(`/urgences/${id}/triage`, {
    method: "PATCH",
    body: JSON.stringify({ niveau_triage }),
  });
}

export function enregistrerConstantes(
  id: number,
  payload: { temperature?: number; tension?: string; poids?: number; pouls?: number },
): Promise<{ data: AdmissionUrgence }> {
  return apiFetch<{ data: AdmissionUrgence }>(`/urgences/${id}/constantes`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export function ajouterActe(
  id: number,
  description: string,
): Promise<{ data: AdmissionUrgence }> {
  return apiFetch<{ data: AdmissionUrgence }>(`/urgences/${id}/actes`, {
    method: "POST",
    body: JSON.stringify({ description }),
  });
}

export function mettreEnObservation(id: number): Promise<{ data: AdmissionUrgence }> {
  return apiFetch<{ data: AdmissionUrgence }>(`/urgences/${id}/observation`, {
    method: "POST",
  });
}

export function sortir(
  id: number,
  issue: IssueUrgence,
): Promise<{ data: AdmissionUrgence }> {
  return apiFetch<{ data: AdmissionUrgence }>(`/urgences/${id}/sortie`, {
    method: "POST",
    body: JSON.stringify({ issue }),
  });
}
