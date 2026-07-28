import { apiFetch } from "@/lib/api-client";
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

export function fetchCarnet(patientId: number): Promise<Carnet> {
  return apiFetch<Carnet>(`/patients/${patientId}/vaccinations`);
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

export function fetchChaineFroid(): Promise<{ data: ReleveTemperature[] }> {
  return apiFetch<{ data: ReleveTemperature[] }>("/chaine-froid");
}

export function addReleveTemperature(
  payload: EnregistrerTemperaturePayload,
): Promise<{ data: ReleveTemperature }> {
  return apiFetch<{ data: ReleveTemperature }>("/chaine-froid", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
