import { apiFetch } from "@/lib/api-client";
import type { PaginatedResponse } from "@/lib/pagination";
import type {
  AdministrerVaccinPayload,
  Carnet,
  CreerLotPayload,
  EnregistrerTemperaturePayload,
  LotVaccin,
  ReleveTemperature,
  Vaccin,
  Vaccination,
} from "./types";

export function fetchVaccins(): Promise<{ data: Vaccin[] }> {
  return apiFetch<{ data: Vaccin[] }>("/vaccins");
}

export function fetchLots(vaccinId: number): Promise<{ data: LotVaccin[] }> {
  return apiFetch<{ data: LotVaccin[] }>(`/vaccins/${vaccinId}/lots`);
}

export function createLot(
  vaccinId: number,
  payload: CreerLotPayload,
): Promise<{ data: LotVaccin }> {
  return apiFetch<{ data: LotVaccin }>(`/vaccins/${vaccinId}/lots`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function fetchCarnet(patientId: number, page = 1): Promise<Carnet> {
  return apiFetch<Carnet>(`/patients/${patientId}/vaccinations?page=${page}`);
}

export function administrerVaccin(
  patientId: number,
  payload: AdministrerVaccinPayload,
): Promise<{ data: Vaccination }> {
  return apiFetch<{ data: Vaccination }>(`/patients/${patientId}/vaccinations`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function fetchChaineFroid(
  page = 1,
): Promise<PaginatedResponse<ReleveTemperature>> {
  return apiFetch<PaginatedResponse<ReleveTemperature>>(`/chaine-froid?page=${page}`);
}

export function addReleveTemperature(
  payload: EnregistrerTemperaturePayload,
): Promise<{ data: ReleveTemperature }> {
  return apiFetch<{ data: ReleveTemperature }>("/chaine-froid", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

// --- Catalogue vaccins (CRUD) ---
export interface VaccinPayload {
  nom: string;
  antigene?: string | null;
  nombre_doses: number;
  intervalle_jours?: number | null;
  age_recommande_jours?: number | null;
}

export function createVaccin(payload: VaccinPayload): Promise<{ data: Vaccin }> {
  return apiFetch<{ data: Vaccin }>("/vaccins", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function updateVaccin(
  id: number,
  payload: VaccinPayload,
): Promise<{ data: Vaccin }> {
  return apiFetch<{ data: Vaccin }>(`/vaccins/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export function deleteVaccin(id: number): Promise<void> {
  return apiFetch<void>(`/vaccins/${id}`, { method: "DELETE" });
}

// --- Campagnes de vaccination (CRUD) ---
export interface CampagneVaccination {
  id: number;
  nom: string;
  date_debut: string;
  date_fin: string | null;
  zone_cible: string | null;
  objectif_doses: number | null;
  doses_administrees: number;
  statut: "planifiee" | "en_cours" | "terminee" | "annulee";
  notes: string | null;
  vaccin: { id: number; nom: string } | null;
}

export interface CampagnePayload {
  nom: string;
  vaccin_id?: number | null;
  date_debut: string;
  date_fin?: string | null;
  zone_cible?: string | null;
  objectif_doses?: number | null;
  doses_administrees?: number;
  statut?: CampagneVaccination["statut"];
  notes?: string | null;
}

export function fetchCampagnes(): Promise<{ data: CampagneVaccination[] }> {
  return apiFetch<{ data: CampagneVaccination[] }>("/campagnes-vaccination");
}

export function createCampagne(
  payload: CampagnePayload,
): Promise<{ data: CampagneVaccination }> {
  return apiFetch<{ data: CampagneVaccination }>("/campagnes-vaccination", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function updateCampagne(
  id: number,
  payload: CampagnePayload,
): Promise<{ data: CampagneVaccination }> {
  return apiFetch<{ data: CampagneVaccination }>(`/campagnes-vaccination/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export function deleteCampagne(id: number): Promise<void> {
  return apiFetch<void>(`/campagnes-vaccination/${id}`, { method: "DELETE" });
}
