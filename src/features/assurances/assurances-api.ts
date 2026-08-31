import { apiFetch } from "@/lib/api-client";
import type { PaginatedResponse } from "@/lib/pagination";
import type {
  AssurancePatient,
  BordereauAssurance,
  CompagnieAssurance,
  PriseEnCharge,
  PriseEnChargeStatut,
} from "./types";

export function fetchCompagnies(): Promise<{ data: CompagnieAssurance[] }> {
  return apiFetch<{ data: CompagnieAssurance[] }>("/compagnies-assurance");
}

export function createCompagnie(payload: {
  nom: string;
  contact_nom?: string;
  contact_telephone?: string;
  contact_email?: string;
  adresse?: string;
  taux_couverture_defaut: number;
}): Promise<{ data: CompagnieAssurance }> {
  return apiFetch<{ data: CompagnieAssurance }>("/compagnies-assurance", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function fetchAssurancesPatient(
  patientId: number,
  page = 1,
): Promise<PaginatedResponse<AssurancePatient>> {
  return apiFetch<PaginatedResponse<AssurancePatient>>(
    `/patients/${patientId}/assurances?page=${page}`,
  );
}

export function createAssurancePatient(
  patientId: number,
  payload: {
    compagnie_assurance_id: number;
    numero_adherent: string;
    taux_couverture?: number;
    date_debut: string;
    date_fin?: string;
  },
): Promise<{ data: AssurancePatient }> {
  return apiFetch<{ data: AssurancePatient }>(`/patients/${patientId}/assurances`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function updateAssurancePatient(
  id: number,
  payload: { statut?: string; taux_couverture?: number; date_fin?: string | null },
): Promise<{ data: AssurancePatient }> {
  return apiFetch<{ data: AssurancePatient }>(`/assurances-patient/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export function fetchPrisesEnCharge(statut?: PriseEnChargeStatut): Promise<{ data: PriseEnCharge[] }> {
  const query = statut ? `?statut=${statut}` : "";
  return apiFetch<{ data: PriseEnCharge[] }>(`/prises-en-charge${query}`);
}

export function demanderPriseEnCharge(
  assurancePatientId: number,
  payload: { motif: string; montant_plafond?: number },
): Promise<{ data: PriseEnCharge }> {
  return apiFetch<{ data: PriseEnCharge }>(`/assurances-patient/${assurancePatientId}/prises-en-charge`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function traiterPriseEnCharge(
  id: number,
  decision: "approuvee" | "refusee",
  commentaire?: string,
): Promise<{ data: PriseEnCharge }> {
  return apiFetch<{ data: PriseEnCharge }>(`/prises-en-charge/${id}/traiter`, {
    method: "PATCH",
    body: JSON.stringify({ decision, commentaire }),
  });
}

export function fetchBordereaux(page = 1): Promise<PaginatedResponse<BordereauAssurance>> {
  return apiFetch<PaginatedResponse<BordereauAssurance>>(`/bordereaux-assurance?page=${page}`);
}

export function fetchBordereau(id: number): Promise<{ data: BordereauAssurance }> {
  return apiFetch<{ data: BordereauAssurance }>(`/bordereaux-assurance/${id}`);
}

export function creerBordereau(compagnieId: number): Promise<{ data: BordereauAssurance }> {
  return apiFetch<{ data: BordereauAssurance }>(`/compagnies-assurance/${compagnieId}/bordereaux`, {
    method: "POST",
  });
}

export function envoyerBordereau(id: number): Promise<{ data: BordereauAssurance }> {
  return apiFetch<{ data: BordereauAssurance }>(`/bordereaux-assurance/${id}/envoyer`, {
    method: "POST",
  });
}

export function reglerBordereau(id: number, montant: number): Promise<{ data: BordereauAssurance }> {
  return apiFetch<{ data: BordereauAssurance }>(`/bordereaux-assurance/${id}/regler`, {
    method: "POST",
    body: JSON.stringify({ montant }),
  });
}

// --- Prise en charge : création & suppression ---
export function creerPriseEnCharge(
  assurancePatientId: number,
  payload: { motif: string; montant_plafond?: number | null },
): Promise<{ data: PriseEnCharge }> {
  return apiFetch<{ data: PriseEnCharge }>(
    `/assurances-patient/${assurancePatientId}/prises-en-charge`,
    { method: "POST", body: JSON.stringify(payload) },
  );
}

export function deletePriseEnCharge(id: number): Promise<void> {
  return apiFetch<void>(`/prises-en-charge/${id}`, { method: "DELETE" });
}
