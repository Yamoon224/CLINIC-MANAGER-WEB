import { ApiError } from "@/lib/api-client";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8010/api";

/**
 * Client API dédié au portail patient — même forme que lib/api-client.ts
 * mais avec sa propre clé de stockage du token ("portail_token" plutôt que
 * "auth_token"). Deux sessions totalement indépendantes plutôt qu'un client
 * générique paramétré : un membre du personnel et un patient peuvent être
 * connectés en même temps dans deux onglets sans jamais se marcher dessus,
 * et il n'y a aucun risque qu'un token de l'un finisse utilisé pour l'autre.
 */
function getPortailToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem("portail_token");
}

export async function portailApiFetch<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const token = getPortailToken();
  const headers = new Headers(options.headers);
  headers.set("Accept", "application/json");
  if (options.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new ApiError(response.status, body);
  }

  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}
