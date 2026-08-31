import { apiFetch } from "@/lib/api-client";
import type { PaginatedResponse } from "@/lib/pagination";
import type { Conge, CongeStatut, Employe, Planning, TypeContrat } from "./types";

export function fetchEmployes(statut?: string): Promise<{ data: Employe[] }> {
  const query = statut ? `?statut=${statut}` : "";
  return apiFetch<{ data: Employe[] }>(`/employes${query}`);
}

export function fetchServices(): Promise<{
  data: { code: string; nom: string }[];
}> {
  return apiFetch<{ data: { code: string; nom: string }[] }>("/services");
}

export function createEmploye(payload: {
  nom: string;
  prenom: string;
  fonction: string;
  service?: string;
  type_contrat: TypeContrat;
  date_embauche: string;
  telephone?: string;
  email?: string;
}): Promise<{ data: Employe }> {
  return apiFetch<{ data: Employe }>("/employes", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function fetchConges(
  statut?: CongeStatut | "",
  page = 1,
): Promise<PaginatedResponse<Conge>> {
  const params = new URLSearchParams({ page: String(page) });
  if (statut) params.set("statut", statut);
  return apiFetch<PaginatedResponse<Conge>>(`/conges?${params}`);
}

export function demanderConge(
  employeId: number,
  payload: { type: string; date_debut: string; date_fin: string; motif?: string },
): Promise<{ data: Conge }> {
  return apiFetch<{ data: Conge }>(`/employes/${employeId}/conges`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function traiterConge(
  id: number,
  decision: "approuve" | "refuse",
  commentaire?: string,
): Promise<{ data: Conge }> {
  return apiFetch<{ data: Conge }>(`/conges/${id}/traiter`, {
    method: "PATCH",
    body: JSON.stringify({ decision, commentaire }),
  });
}

export function fetchPlanning(
  dateDebut?: string,
  dateFin?: string,
  page = 1,
  perPage = 20,
): Promise<PaginatedResponse<Planning>> {
  const params = new URLSearchParams({ page: String(page), per_page: String(perPage) });
  if (dateDebut) params.set("date_debut", dateDebut);
  if (dateFin) params.set("date_fin", dateFin);
  return apiFetch<PaginatedResponse<Planning>>(`/planning?${params}`);
}

export function assignerPlanning(
  employeId: number,
  payload: { date: string; creneau: string; service?: string },
): Promise<{ data: Planning }> {
  return apiFetch<{ data: Planning }>(`/employes/${employeId}/planning`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function retirerPlanning(id: number): Promise<void> {
  return apiFetch<void>(`/planning/${id}`, { method: "DELETE" });
}
