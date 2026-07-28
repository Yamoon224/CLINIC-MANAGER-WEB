import { apiFetch } from "@/lib/api-client";
import type {
  Alertes,
  CreerLotPayload,
  Dispensation,
  DispenserPayload,
  LotMedicament,
  Medicament,
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
): Promise<{ data: Dispensation[] }> {
  return apiFetch<{ data: Dispensation[] }>(`/patients/${patientId}/dispensations`);
}
