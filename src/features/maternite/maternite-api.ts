import { apiFetch } from "@/lib/api-client";
import type {
  Accouchement,
  ConsultationPrenatale,
  CreateAccouchementPayload,
  CreateCpnPayload,
  CreateGrossessePayload,
  CreateNouveauNePayload,
  Grossesse,
  NouveauNe,
} from "./types";

export function fetchGrossesses(patientId: number): Promise<{ data: Grossesse[] }> {
  return apiFetch<{ data: Grossesse[] }>(`/patients/${patientId}/grossesses`);
}

export function getGrossesse(id: number): Promise<{ data: Grossesse }> {
  return apiFetch<{ data: Grossesse }>(`/grossesses/${id}`);
}

export function createGrossesse(
  patientId: number,
  payload: CreateGrossessePayload,
): Promise<{ data: Grossesse }> {
  return apiFetch<{ data: Grossesse }>(`/patients/${patientId}/grossesses`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function addCpn(
  grossesseId: number,
  payload: CreateCpnPayload,
): Promise<{ data: ConsultationPrenatale }> {
  return apiFetch<{ data: ConsultationPrenatale }>(`/grossesses/${grossesseId}/cpn`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function createAccouchement(
  grossesseId: number,
  payload: CreateAccouchementPayload,
): Promise<{ data: Accouchement }> {
  return apiFetch<{ data: Accouchement }>(`/grossesses/${grossesseId}/accouchement`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function addNouveauNe(
  accouchementId: number,
  payload: CreateNouveauNePayload,
): Promise<{ data: NouveauNe }> {
  return apiFetch<{ data: NouveauNe }>(`/accouchements/${accouchementId}/nouveau-nes`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
