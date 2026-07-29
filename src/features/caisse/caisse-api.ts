import { apiFetch } from "@/lib/api-client";
import type {
  Depense,
  Facturable,
  Facture,
  LigneInput,
  ModePaiement,
  SessionCaisse,
} from "./types";

export function fetchFacturables(patientId: number): Promise<{ data: Facturable[] }> {
  return apiFetch<{ data: Facturable[] }>(`/patients/${patientId}/facturables`);
}

export function fetchPatientFactures(patientId: number): Promise<{ data: Facture[] }> {
  return apiFetch<{ data: Facture[] }>(`/patients/${patientId}/factures`);
}

export function createFacture(
  patientId: number,
  lignes: LigneInput[],
  priseEnChargeId?: number,
): Promise<{ data: Facture }> {
  return apiFetch<{ data: Facture }>(`/patients/${patientId}/factures`, {
    method: "POST",
    body: JSON.stringify({ lignes, prise_en_charge_id: priseEnChargeId }),
  });
}

export function fetchFacture(id: number): Promise<{ data: Facture }> {
  return apiFetch<{ data: Facture }>(`/factures/${id}`);
}

export function annulerFacture(id: number): Promise<{ data: Facture }> {
  return apiFetch<{ data: Facture }>(`/factures/${id}/annuler`, { method: "POST" });
}

export function encaisser(
  factureId: number,
  payload: { montant: number; mode_paiement: ModePaiement; reference?: string },
): Promise<{ data: Facture }> {
  return apiFetch<{ data: Facture }>(`/factures/${factureId}/encaissements`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function fetchCreances(): Promise<{ data: Facture[] }> {
  return apiFetch<{ data: Facture[] }>("/factures/creances");
}

export function fetchSessionCourante(): Promise<{ data: SessionCaisse | null }> {
  return apiFetch<{ data: SessionCaisse | null }>("/sessions-caisse/courante");
}

export function ouvrirSession(montantOuverture: number): Promise<{ data: SessionCaisse }> {
  return apiFetch<{ data: SessionCaisse }>("/sessions-caisse", {
    method: "POST",
    body: JSON.stringify({ montant_ouverture: montantOuverture }),
  });
}

export function cloturerSession(
  id: number,
  montantCloture: number,
): Promise<{ data: SessionCaisse }> {
  return apiFetch<{ data: SessionCaisse }>(`/sessions-caisse/${id}/cloturer`, {
    method: "POST",
    body: JSON.stringify({ montant_cloture: montantCloture }),
  });
}

export function fetchDepenses(): Promise<{ data: Depense[] }> {
  return apiFetch<{ data: Depense[] }>("/depenses");
}

export function createDepense(payload: {
  categorie: string;
  montant: number;
  description?: string;
}): Promise<{ data: Depense }> {
  return apiFetch<{ data: Depense }>("/depenses", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
