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

/**
 * Fetches a PDF from an authenticated API endpoint and downloads it via the
 * browser's native save flow. A plain `<a href>` can't carry the Bearer
 * token this app uses (no cookie session), so the file has to be fetched as
 * a blob first.
 *
 * Deliberately downloads rather than opening a new tab: a blob: URL created
 * in this window isn't reliably loadable from a tab opened via
 * `window.open` (Chromium treats it as a separate browsing context), and
 * opening it asynchronously after the `fetch` also risks the popup blocker
 * since it's no longer inside the click's user-gesture stack. A same-window
 * anchor download sidesteps both.
 */
export async function openPdf(path: string, fallbackFilename = "document.pdf"): Promise<void> {
  const token = getToken();
  const headers = new Headers({ Accept: "application/pdf" });
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const response = await fetch(`${API_BASE_URL}${path}`, { headers });
  if (!response.ok) {
    throw new Error(`Impossible de générer le PDF (${response.status})`);
  }

  const filename = filenameFromContentDisposition(response.headers.get("content-disposition")) ?? fallbackFilename;
  const blob = await response.blob();
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 60_000);
}
