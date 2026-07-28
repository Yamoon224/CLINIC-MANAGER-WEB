import { apiFetch } from "@/lib/api-client";
import type { Patient, RegisterPatientPayload } from "./types";

export function searchPatients(query: string): Promise<{ data: Patient[] }> {
  const params = query ? `?q=${encodeURIComponent(query)}` : "";
  return apiFetch<{ data: Patient[] }>(`/patients${params}`);
}

export function getPatient(id: number): Promise<{ data: Patient }> {
  return apiFetch<{ data: Patient }>(`/patients/${id}`);
}

export function registerPatient(
  payload: RegisterPatientPayload,
): Promise<{ data: Patient }> {
  return apiFetch<{ data: Patient }>("/patients", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
