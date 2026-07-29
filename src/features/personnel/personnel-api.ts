import { apiFetch } from "@/lib/api-client";
import type { Conge, CongeStatut, Employe, Planning, TypeContrat } from "./types";

export function fetchEmployes(statut?: string): Promise<{ data: Employe[] }> {
  const query = statut ? `?statut=${statut}` : "";
  return apiFetch<{ data: Employe[] }>(`/employes${query}`);
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

export function fetchConges(statut?: CongeStatut | ""): Promise<{ data: Conge[] }> {
  const query = statut ? `?statut=${statut}` : "";
  return apiFetch<{ data: Conge[] }>(`/conges${query}`);
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

export function fetchPlanning(dateDebut?: string, dateFin?: string): Promise<{ data: Planning[] }> {
  const params = new URLSearchParams();
  if (dateDebut) params.set("date_debut", dateDebut);
  if (dateFin) params.set("date_fin", dateFin);
  const query = params.toString() ? `?${params.toString()}` : "";
  return apiFetch<{ data: Planning[] }>(`/planning${query}`);
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
