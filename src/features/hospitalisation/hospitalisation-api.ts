import { apiFetch } from "@/lib/api-client";
import type { AdmettrePayload, AjouterSuiviPayload, Lit, Sejour } from "./types";

export function fetchLits(): Promise<{ data: Lit[] }> {
  return apiFetch<{ data: Lit[] }>("/lits");
}

export function libererLit(id: number): Promise<{ data: Lit }> {
  return apiFetch<{ data: Lit }>(`/lits/${id}/liberer`, { method: "POST" });
}

export function admettre(
  patientId: number,
  payload: AdmettrePayload,
): Promise<{ data: Sejour }> {
  return apiFetch<{ data: Sejour }>(`/patients/${patientId}/sejours`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function fetchSejour(id: number): Promise<{ data: Sejour }> {
  return apiFetch<{ data: Sejour }>(`/sejours/${id}`);
}

export function fetchPatientSejours(patientId: number): Promise<{ data: Sejour[] }> {
  return apiFetch<{ data: Sejour[] }>(`/patients/${patientId}/sejours`);
}

export function transferer(sejourId: number, litId: number): Promise<{ data: Sejour }> {
  return apiFetch<{ data: Sejour }>(`/sejours/${sejourId}/transfert`, {
    method: "POST",
    body: JSON.stringify({ lit_id: litId }),
  });
}

export function ajouterSuivi(
  sejourId: number,
  payload: AjouterSuiviPayload,
): Promise<{ data: Sejour }> {
  return apiFetch<{ data: Sejour }>(`/sejours/${sejourId}/suivis`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function sortir(sejourId: number): Promise<{ data: Sejour }> {
  return apiFetch<{ data: Sejour }>(`/sejours/${sejourId}/sortie`, {
    method: "POST",
  });
}
