import { apiFetch } from "@/lib/api-client";
import type { PaginatedResponse } from "@/lib/pagination";
import type {
  Consultation,
  Prescription,
  StartConsultationPayload,
  UpdateConsultationPayload,
} from "./types";

export function startConsultation(
  payload: StartConsultationPayload,
): Promise<{ data: Consultation }> {
  return apiFetch<{ data: Consultation }>("/consultations", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function getConsultation(id: number): Promise<{ data: Consultation }> {
  return apiFetch<{ data: Consultation }>(`/consultations/${id}`);
}

export function updateConsultation(
  id: number,
  payload: UpdateConsultationPayload,
): Promise<{ data: Consultation }> {
  return apiFetch<{ data: Consultation }>(`/consultations/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export function addPrescription(
  consultationId: number,
  payload: {
    type: string;
    designation: string;
    instructions?: string;
    analyse_type_id?: number;
    medicament_id?: number;
  },
): Promise<{ data: Prescription }> {
  return apiFetch<{ data: Prescription }>(
    `/consultations/${consultationId}/prescriptions`,
    { method: "POST", body: JSON.stringify(payload) },
  );
}

export function completeConsultation(
  id: number,
): Promise<{ data: Consultation }> {
  return apiFetch<{ data: Consultation }>(`/consultations/${id}/terminer`, {
    method: "POST",
  });
}

export function fetchPatientHistory(
  patientId: number,
  page = 1,
): Promise<PaginatedResponse<Consultation>> {
  return apiFetch<PaginatedResponse<Consultation>>(
    `/patients/${patientId}/consultations?page=${page}`,
  );
}
