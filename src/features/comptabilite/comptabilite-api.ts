import { apiFetch } from "@/lib/api-client";
import type { PaginatedResponse } from "@/lib/pagination";
import type {
  BaremeTranche,
  BulletinPaie,
  EcritureComptable,
  EtatFinancier,
  EmployeRemuneration,
  PeriodePaie,
  RubriquePaie,
  RubriquePayload,
} from "./types";

// --- Rubriques de paie ---
export function fetchRubriques(): Promise<{ data: RubriquePaie[] }> {
  return apiFetch<{ data: RubriquePaie[] }>("/rubriques-paie");
}

export function createRubrique(
  payload: RubriquePayload,
): Promise<{ data: RubriquePaie }> {
  return apiFetch<{ data: RubriquePaie }>("/rubriques-paie", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function updateRubrique(
  id: number,
  payload: RubriquePayload,
): Promise<{ data: RubriquePaie }> {
  return apiFetch<{ data: RubriquePaie }>(`/rubriques-paie/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export function deleteRubrique(id: number): Promise<void> {
  return apiFetch<void>(`/rubriques-paie/${id}`, { method: "DELETE" });
}

// --- Barème ITS ---
export function fetchBaremeIts(): Promise<{ data: BaremeTranche[] }> {
  return apiFetch<{ data: BaremeTranche[] }>("/bareme-its");
}

export function saveBaremeIts(
  tranches: Omit<BaremeTranche, "id" | "ordre">[],
): Promise<{ data: BaremeTranche[] }> {
  return apiFetch<{ data: BaremeTranche[] }>("/bareme-its", {
    method: "PUT",
    body: JSON.stringify({ tranches }),
  });
}

// --- Rémunération d'un employé ---
export function fetchEmployeRemuneration(
  employeId: number,
): Promise<{ data: EmployeRemuneration }> {
  return apiFetch<{ data: EmployeRemuneration }>(
    `/employes/${employeId}/remuneration`,
  );
}

export function saveEmployeRemuneration(
  employeId: number,
  payload: {
    salaire_base: number;
    rubriques: { rubrique_paie_id: number; montant?: number | null; taux?: number | null }[];
  },
): Promise<{ data: EmployeRemuneration }> {
  return apiFetch<{ data: EmployeRemuneration }>(
    `/employes/${employeId}/remuneration`,
    { method: "PUT", body: JSON.stringify(payload) },
  );
}

// --- Périodes de paie ---
export function fetchPeriodesPaie(
  page = 1,
): Promise<PaginatedResponse<PeriodePaie>> {
  return apiFetch<PaginatedResponse<PeriodePaie>>(`/periodes-paie?page=${page}`);
}

export function genererPeriode(mois: string): Promise<{ data: PeriodePaie }> {
  return apiFetch<{ data: PeriodePaie }>("/periodes-paie", {
    method: "POST",
    body: JSON.stringify({ mois }),
  });
}

export function fetchPeriodePaie(id: number): Promise<{ data: PeriodePaie }> {
  return apiFetch<{ data: PeriodePaie }>(`/periodes-paie/${id}`);
}

export function actionPeriode(
  id: number,
  action: "recalculer" | "valider" | "cloturer",
): Promise<{ data: PeriodePaie }> {
  return apiFetch<{ data: PeriodePaie }>(`/periodes-paie/${id}/${action}`, {
    method: "POST",
  });
}

// --- Bulletins ---
export function fetchBulletin(id: number): Promise<{ data: BulletinPaie }> {
  return apiFetch<{ data: BulletinPaie }>(`/bulletins-paie/${id}`);
}

export function payerBulletin(
  id: number,
  modePaiement: string,
): Promise<{ data: BulletinPaie }> {
  return apiFetch<{ data: BulletinPaie }>(`/bulletins-paie/${id}/payer`, {
    method: "POST",
    body: JSON.stringify({ mode_paiement: modePaiement }),
  });
}

// --- Journal & état financier ---
export function fetchJournal(params: {
  page?: number;
  from?: string;
  to?: string;
  journal?: string;
}): Promise<PaginatedResponse<EcritureComptable>> {
  const q = new URLSearchParams();
  if (params.page) q.set("page", String(params.page));
  if (params.from) q.set("from", params.from);
  if (params.to) q.set("to", params.to);
  if (params.journal) q.set("journal", params.journal);
  return apiFetch<PaginatedResponse<EcritureComptable>>(
    `/comptabilite/journal?${q}`,
  );
}

export function fetchEtatFinancier(params: {
  from?: string;
  to?: string;
}): Promise<{ data: EtatFinancier }> {
  const q = new URLSearchParams();
  if (params.from) q.set("from", params.from);
  if (params.to) q.set("to", params.to);
  return apiFetch<{ data: EtatFinancier }>(
    `/comptabilite/etat-financier?${q}`,
  );
}
