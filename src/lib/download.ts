const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8010/api";

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem("auth_token");
}

function filenameFromContentDisposition(header: string | null): string | null {
  if (!header) return null;
  const match = /filename="?([^";]+)"?/i.exec(header);
  return match ? match[1] : null;
}

/** Erreur d'export porteuse d'un message lisible destiné à l'utilisateur. */
export class DownloadError extends Error {
  constructor(
    message: string,
    public readonly kind: "network" | "auth" | "forbidden" | "notfound" | "server" | "unknown",
    public readonly status?: number,
  ) {
    super(message);
    this.name = "DownloadError";
  }
}

async function readServerMessage(response: Response): Promise<string | null> {
  try {
    const text = await response.clone().text();
    if (!text) return null;
    const json = JSON.parse(text) as { message?: unknown };
    return typeof json.message === "string" ? json.message : null;
  } catch {
    return null;
  }
}

async function fetchOnce(path: string, accept: string, timeoutMs: number): Promise<Response> {
  const token = getToken();
  const headers = new Headers({ Accept: accept });
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(`${API_BASE_URL}${path}`, {
      headers,
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Récupère un fichier (PDF, CSV, ...) depuis une route API authentifiée et le
 * télécharge via le flux natif du navigateur. Un `<a href>` simple ne peut pas
 * porter le Bearer token de l'app (pas de session cookie), d'où le fetch en
 * blob d'abord.
 *
 * Téléchargement plutôt qu'ouverture d'onglet : une URL blob: créée dans cette
 * fenêtre n'est pas chargeable de façon fiable depuis un onglet ouvert par
 * `window.open` (Chromium la traite comme un contexte séparé), et l'ouvrir
 * après le `fetch` risque le bloqueur de pop-up.
 *
 * Réessaie une fois en cas d'erreur réseau (le serveur de dev mono-thread peut
 * mettre plusieurs secondes à répondre sous charge) et remonte un message
 * d'erreur explicite (`DownloadError`).
 */
export async function downloadFile(
  path: string,
  fallbackFilename = "document",
  accept = "*/*",
  { timeoutMs = 60_000, retries = 1 }: { timeoutMs?: number; retries?: number } = {},
): Promise<void> {
  let response: Response;
  try {
    response = await fetchOnce(path, accept, timeoutMs);
  } catch (error) {
    const aborted = error instanceof DOMException && error.name === "AbortError";
    if (retries > 0 && !aborted) {
      await new Promise((r) => setTimeout(r, 800));
      return downloadFile(path, fallbackFilename, accept, { timeoutMs, retries: retries - 1 });
    }
    throw new DownloadError(
      aborted
        ? "Le serveur met trop de temps à répondre. Réessayez dans un instant."
        : "Serveur injoignable. Vérifiez votre connexion ou que le serveur est démarré.",
      "network",
    );
  }

  if (!response.ok) {
    const serverMessage = await readServerMessage(response);
    if (response.status === 401) {
      throw new DownloadError(
        serverMessage ?? "Session expirée — reconnectez-vous.",
        "auth",
        401,
      );
    }
    if (response.status === 403) {
      throw new DownloadError(
        serverMessage ?? "Vous n'avez pas l'autorisation d'exporter ce document.",
        "forbidden",
        403,
      );
    }
    if (response.status === 404) {
      throw new DownloadError(serverMessage ?? "Document introuvable.", "notfound", 404);
    }
    if (response.status >= 500) {
      throw new DownloadError(
        serverMessage ?? `Erreur serveur lors de la génération du document (${response.status}).`,
        "server",
        response.status,
      );
    }
    throw new DownloadError(
      serverMessage ?? `Échec de l'export (code ${response.status}).`,
      "unknown",
      response.status,
    );
  }

  const filename =
    filenameFromContentDisposition(response.headers.get("content-disposition")) ??
    fallbackFilename;
  const blob = await response.blob();

  if (blob.size === 0) {
    throw new DownloadError("Le document généré est vide.", "server");
  }

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 60_000);
}
