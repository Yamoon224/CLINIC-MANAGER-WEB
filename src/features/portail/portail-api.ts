import { portailApiFetch } from "@/lib/portail-api-client";
import type {
  CreatePortailRendezVousPayload,
  PortailFacture,
  PortailLoginCredentials,
  PortailLoginResponse,
  PortailPatient,
  PortailPraticien,
  PortailRendezVous,
  PortailResultat,
  RendezVousType,
} from "./types";

export function portailLogin(
  credentials: PortailLoginCredentials,
): Promise<PortailLoginResponse> {
  return portailApiFetch<PortailLoginResponse>("/portail/login", {
    method: "POST",
    body: JSON.stringify(credentials),
  });
}

export function portailLogout(): Promise<void> {
  return portailApiFetch<void>("/portail/logout", { method: "POST" });
}

export async function fetchPortailMe(): Promise<PortailPatient> {
  const { data } = await portailApiFetch<{ data: PortailPatient }>("/portail/me");
  return data;
}

export function portailChangePassword(payload: {
  current_password: string;
  password: string;
  password_confirmation: string;
}): Promise<void> {
  return portailApiFetch<void>("/portail/me/password", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function fetchMesRendezVous(): Promise<PortailRendezVous[]> {
  const { data } = await portailApiFetch<{ data: PortailRendezVous[] }>("/portail/rendez-vous");
  return data;
}

export async function fetchPortailPraticiens(): Promise<PortailPraticien[]> {
  const { data } = await portailApiFetch<{ data: PortailPraticien[] }>("/portail/praticiens");
  return data;
}

export async function fetchPortailCreneauxDisponibles(
  praticienId: number,
  type: RendezVousType,
  date: string,
): Promise<string[]> {
  const params = new URLSearchParams({
    praticien_id: String(praticienId),
    type,
    date,
  });
  const { data } = await portailApiFetch<{ data: string[] }>(
    `/portail/creneaux-disponibles?${params}`,
  );
  return data;
}

export async function reserverRendezVous(
  payload: CreatePortailRendezVousPayload,
): Promise<PortailRendezVous> {
  const { data } = await portailApiFetch<{ data: PortailRendezVous }>("/portail/rendez-vous", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return data;
}

export async function annulerRendezVous(id: number): Promise<PortailRendezVous> {
  const { data } = await portailApiFetch<{ data: PortailRendezVous }>(
    `/portail/rendez-vous/${id}/annuler`,
    { method: "POST" },
  );
  return data;
}

export async function fetchMesResultats(): Promise<PortailResultat[]> {
  const { data } = await portailApiFetch<{ data: PortailResultat[] }>("/portail/resultats");
  return data;
}

export async function fetchMesFactures(): Promise<PortailFacture[]> {
  const { data } = await portailApiFetch<{ data: PortailFacture[] }>("/portail/factures");
  return data;
}
