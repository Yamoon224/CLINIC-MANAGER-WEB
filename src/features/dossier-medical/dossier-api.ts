import { apiFetch } from "@/lib/api-client";
import type { DossierMedical } from "./types";

export function fetchDossierMedical(
  patientId: number,
): Promise<{ data: DossierMedical }> {
  return apiFetch<{ data: DossierMedical }>(
    `/patients/${patientId}/dossier-medical`,
  );
}

/**
 * Résout l'UUID opaque d'une carte patient scannée en identifiant de patient,
 * pour rediriger vers son dossier médical. Nécessite un personnel authentifié.
 */
export function fetchPatientByCarte(
  carteUuid: string,
): Promise<{ data: { id: number } }> {
  return apiFetch<{ data: { id: number } }>(`/cartes/${carteUuid}`);
}
