import { apiFetch } from "@/lib/api-client";
import type {
  CreateRendezVousPayload,
  Praticien,
  RendezVous,
  RendezVousType,
} from "./types";

export function fetchPraticiens(): Promise<{ data: Praticien[] }> {
  return apiFetch<{ data: Praticien[] }>("/praticiens");
}

export function fetchAgenda(
  date: string,
  praticienId?: number,
): Promise<{ data: RendezVous[] }> {
  const params = new URLSearchParams({ from: date, to: date });
  if (praticienId) params.set("praticien_id", String(praticienId));
  return apiFetch<{ data: RendezVous[] }>(`/rendez-vous?${params}`);
}

export function createRendezVous(
  payload: CreateRendezVousPayload,
): Promise<{ data: RendezVous }> {
  return apiFetch<{ data: RendezVous }>("/rendez-vous", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function changerStatutRendezVous(
  id: number,
  statut: RendezVous["statut"],
): Promise<{ data: RendezVous }> {
  return apiFetch<{ data: RendezVous }>(`/rendez-vous/${id}/statut`, {
    method: "PATCH",
    body: JSON.stringify({ statut }),
  });
}

export function fetchCreneauxDisponibles(
  praticienId: number,
  type: RendezVousType,
  date: string,
): Promise<{ data: string[] }> {
  const params = new URLSearchParams({
    praticien_id: String(praticienId),
    type,
    date,
  });
  return apiFetch<{ data: string[] }>(`/rendez-vous/creneaux-disponibles?${params}`);
}
