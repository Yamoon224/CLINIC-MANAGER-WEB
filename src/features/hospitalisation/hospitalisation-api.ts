import { apiFetch } from "@/lib/api-client";
import type { PaginatedResponse } from "@/lib/pagination";
import type {
  AdmettrePayload,
  AjouterSuiviPayload,
  Lit,
  Operation,
  PlanifierOperationPayload,
  Sejour,
} from "./types";

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

export function fetchPatientSejours(
  patientId: number,
  page = 1,
): Promise<PaginatedResponse<Sejour>> {
  return apiFetch<PaginatedResponse<Sejour>>(`/patients/${patientId}/sejours?page=${page}`);
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

export function fetchOperations(
  sejourId: number,
  page = 1,
): Promise<PaginatedResponse<Operation>> {
  return apiFetch<PaginatedResponse<Operation>>(
    `/sejours/${sejourId}/operations?page=${page}`,
  );
}

export function planifierOperation(
  sejourId: number,
  payload: PlanifierOperationPayload,
): Promise<{ data: Operation }> {
  return apiFetch<{ data: Operation }>(`/sejours/${sejourId}/operations`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function terminerOperation(
  operationId: number,
  compteRendu: string,
): Promise<{ data: Operation }> {
  return apiFetch<{ data: Operation }>(`/operations/${operationId}/terminer`, {
    method: "POST",
    body: JSON.stringify({ compte_rendu: compteRendu }),
  });
}

export function annulerOperation(operationId: number): Promise<{ data: Operation }> {
  return apiFetch<{ data: Operation }>(`/operations/${operationId}/annuler`, {
    method: "POST",
  });
}
