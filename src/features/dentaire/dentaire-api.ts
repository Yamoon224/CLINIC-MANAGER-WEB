import { apiFetch } from "@/lib/api-client";
import type { PaginatedResponse } from "@/lib/pagination";
import type {
  ActeDentaire,
  ActeDentairePayload,
  ConsultationDentaire,
  ConsultationDentairePayload,
  ConsultationDentaireUpdate,
  Dentiste,
  OrdonnanceDentaire,
  OrdonnanceDentairePayload,
  TraitementDentaire,
  TraitementDentairePayload,
  TraitementStatut,
} from "./types";

function listParams(page: number, perPage: number, search: string): URLSearchParams {
  const params = new URLSearchParams({ page: String(page), per_page: String(perPage) });
  if (search) params.set("q", search);
  return params;
}

export function fetchDentistes(): Promise<{ data: Dentiste[] }> {
  return apiFetch<{ data: Dentiste[] }>("/dentaire/praticiens");
}

// --- Grille tarifaire ---
export function fetchActes(): Promise<{ data: ActeDentaire[] }> {
  return apiFetch<{ data: ActeDentaire[] }>("/dentaire/actes");
}

export function createActe(payload: ActeDentairePayload): Promise<{ data: ActeDentaire }> {
  return apiFetch<{ data: ActeDentaire }>("/dentaire/actes", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function updateActe(
  id: number,
  payload: Partial<ActeDentairePayload>,
): Promise<{ data: ActeDentaire }> {
  return apiFetch<{ data: ActeDentaire }>(`/dentaire/actes/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export function deleteActe(id: number): Promise<void> {
  return apiFetch<void>(`/dentaire/actes/${id}`, { method: "DELETE" });
}

// --- Consultations ---
export function fetchConsultationsDentaires(
  page = 1,
  perPage = 20,
  search = "",
): Promise<PaginatedResponse<ConsultationDentaire>> {
  return apiFetch<PaginatedResponse<ConsultationDentaire>>(
    `/dentaire/consultations?${listParams(page, perPage, search)}`,
  );
}

export function createConsultationDentaire(
  payload: ConsultationDentairePayload,
): Promise<{ data: ConsultationDentaire }> {
  return apiFetch<{ data: ConsultationDentaire }>("/dentaire/consultations", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function updateConsultationDentaire(
  id: number,
  payload: ConsultationDentaireUpdate,
): Promise<{ data: ConsultationDentaire }> {
  return apiFetch<{ data: ConsultationDentaire }>(`/dentaire/consultations/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

// --- Traitements ---
export function fetchTraitementsDentaires(
  page = 1,
  perPage = 20,
  search = "",
  statut?: TraitementStatut,
): Promise<PaginatedResponse<TraitementDentaire>> {
  const params = listParams(page, perPage, search);
  if (statut) params.set("statut", statut);
  return apiFetch<PaginatedResponse<TraitementDentaire>>(`/dentaire/traitements?${params}`);
}

export function fetchTraitementDentaire(id: number): Promise<{ data: TraitementDentaire }> {
  return apiFetch<{ data: TraitementDentaire }>(`/dentaire/traitements/${id}`);
}

export function createTraitementDentaire(
  payload: TraitementDentairePayload,
): Promise<{ data: TraitementDentaire }> {
  return apiFetch<{ data: TraitementDentaire }>("/dentaire/traitements", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function terminerTraitementDentaire(id: number): Promise<{ data: TraitementDentaire }> {
  return apiFetch<{ data: TraitementDentaire }>(`/dentaire/traitements/${id}/terminer`, {
    method: "POST",
  });
}

export function annulerTraitementDentaire(id: number): Promise<{ data: TraitementDentaire }> {
  return apiFetch<{ data: TraitementDentaire }>(`/dentaire/traitements/${id}/annuler`, {
    method: "POST",
  });
}

// --- Ordonnances ---
export function fetchOrdonnancesDentaires(
  page = 1,
  perPage = 20,
  search = "",
): Promise<PaginatedResponse<OrdonnanceDentaire>> {
  return apiFetch<PaginatedResponse<OrdonnanceDentaire>>(
    `/dentaire/ordonnances?${listParams(page, perPage, search)}`,
  );
}

export function createOrdonnanceDentaire(
  payload: OrdonnanceDentairePayload,
): Promise<{ data: OrdonnanceDentaire }> {
  return apiFetch<{ data: OrdonnanceDentaire }>("/dentaire/ordonnances", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function updateOrdonnanceDentaire(
  id: number,
  payload: OrdonnanceDentairePayload,
): Promise<{ data: OrdonnanceDentaire }> {
  return apiFetch<{ data: OrdonnanceDentaire }>(`/dentaire/ordonnances/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export function deleteOrdonnanceDentaire(id: number): Promise<void> {
  return apiFetch<void>(`/dentaire/ordonnances/${id}`, { method: "DELETE" });
}

// --- Imprimés (chemins passés à PdfButton) ---
export function recuConsultationPath(consultationId: number): string {
  return `/dentaire/consultations/${consultationId}/recu.pdf`;
}

export function recuTraitementPath(traitementId: number, encaissementId: number): string {
  return `/dentaire/traitements/${traitementId}/encaissements/${encaissementId}/recu.pdf`;
}

export function ordonnancePdfPath(ordonnanceId: number): string {
  return `/dentaire/ordonnances/${ordonnanceId}/pdf`;
}
