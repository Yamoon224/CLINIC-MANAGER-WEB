import { apiFetch } from "@/lib/api-client";
import type { PaginatedResponse } from "@/lib/pagination";
import type {
  Alertes,
  CreerLotPayload,
  Dispensation,
  DispenserPayload,
  GraviteInteraction,
  InteractionMedicamenteuse,
  LotMedicament,
  Medicament,
  PrescriptionEnAttente,
} from "./types";

export function fetchMedicaments(): Promise<{ data: Medicament[] }> {
  return apiFetch<{ data: Medicament[] }>("/medicaments");
}

export function fetchLots(medicamentId: number): Promise<{ data: LotMedicament[] }> {
  return apiFetch<{ data: LotMedicament[] }>(`/medicaments/${medicamentId}/lots`);
}

export function createLot(
  medicamentId: number,
  payload: CreerLotPayload,
): Promise<{ data: LotMedicament }> {
  return apiFetch<{ data: LotMedicament }>(`/medicaments/${medicamentId}/lots`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function fetchSubstitutions(
  medicamentId: number,
): Promise<{ data: Medicament[] }> {
  return apiFetch<{ data: Medicament[] }>(`/medicaments/${medicamentId}/substitutions`);
}

export function fetchAlertes(): Promise<Alertes> {
  return apiFetch<Alertes>("/medicaments-alertes");
}

export function fetchPrescriptionsEnAttente(): Promise<{ data: PrescriptionEnAttente[] }> {
  return apiFetch<{ data: PrescriptionEnAttente[] }>("/prescriptions-en-attente");
}

export function fetchInteractions(): Promise<{ data: InteractionMedicamenteuse[] }> {
  return apiFetch<{ data: InteractionMedicamenteuse[] }>("/interactions-medicamenteuses");
}

export function createInteraction(payload: {
  medicament_a_id: number;
  medicament_b_id: number;
  gravite: GraviteInteraction;
  description?: string;
}): Promise<{ data: InteractionMedicamenteuse }> {
  return apiFetch<{ data: InteractionMedicamenteuse }>("/interactions-medicamenteuses", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function deleteInteraction(id: number): Promise<void> {
  return apiFetch<void>(`/interactions-medicamenteuses/${id}`, { method: "DELETE" });
}

export function checkInteractions(
  medicamentIds: number[],
): Promise<{ data: InteractionMedicamenteuse[] }> {
  const params = new URLSearchParams();
  medicamentIds.forEach((id) => params.append("medicament_ids[]", String(id)));
  return apiFetch<{ data: InteractionMedicamenteuse[] }>(`/interactions-medicamenteuses/verifier?${params}`);
}

export function dispenser(
  payload: DispenserPayload,
): Promise<{ data: Dispensation }> {
  return apiFetch<{ data: Dispensation }>("/dispensations", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function fetchPatientDispensations(
  patientId: number,
  page = 1,
): Promise<PaginatedResponse<Dispensation>> {
  return apiFetch<PaginatedResponse<Dispensation>>(
    `/patients/${patientId}/dispensations?page=${page}`,
  );
}
