import { apiFetch } from "@/lib/api-client";
import type { PaginatedResponse } from "@/lib/pagination";
import type { AnalyseType, DemandeAnalyse, DemanderAnalysesPayload } from "./types";

export function fetchAnalyseTypes(): Promise<{ data: AnalyseType[] }> {
  return apiFetch<{ data: AnalyseType[] }>("/analyse-types");
}

export function fetchWorkList(
  page = 1,
): Promise<PaginatedResponse<DemandeAnalyse>> {
  return apiFetch<PaginatedResponse<DemandeAnalyse>>(`/demandes-analyse?page=${page}`);
}

export function fetchPatientDemandes(
  patientId: number,
  page = 1,
): Promise<PaginatedResponse<DemandeAnalyse>> {
  return apiFetch<PaginatedResponse<DemandeAnalyse>>(
    `/patients/${patientId}/demandes-analyse?page=${page}`,
  );
}

export function createDemandes(
  patientId: number,
  payload: DemanderAnalysesPayload,
): Promise<{ data: DemandeAnalyse[] }> {
  return apiFetch<{ data: DemandeAnalyse[] }>(`/patients/${patientId}/demandes-analyse`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function preleve(id: number): Promise<{ data: DemandeAnalyse }> {
  return apiFetch<{ data: DemandeAnalyse }>(`/demandes-analyse/${id}/preleve`, {
    method: "POST",
  });
}

export function saisirResultat(
  id: number,
  valeur: string,
): Promise<{ data: DemandeAnalyse }> {
  return apiFetch<{ data: DemandeAnalyse }>(`/demandes-analyse/${id}/resultat`, {
    method: "POST",
    body: JSON.stringify({ valeur }),
  });
}

export function validerBiologiste(
  id: number,
  commentaire?: string,
): Promise<{ data: DemandeAnalyse }> {
  return apiFetch<{ data: DemandeAnalyse }>(`/demandes-analyse/${id}/validation-biologiste`, {
    method: "POST",
    body: JSON.stringify({ commentaire: commentaire || undefined }),
  });
}

export function annuler(id: number): Promise<{ data: DemandeAnalyse }> {
  return apiFetch<{ data: DemandeAnalyse }>(`/demandes-analyse/${id}/annuler`, {
    method: "POST",
  });
}
