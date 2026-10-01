/* Le cabinet dentaire facture en francs guinéens (cf. reçus et grille tarifaire). */
export function gnf(value: string | number | null | undefined): string {
  const n = typeof value === "string" ? Number(value) : (value ?? 0);
  if (Number.isNaN(n)) return "-";
  return `${n.toLocaleString("fr-FR", { maximumFractionDigits: 0 })} GNF`;
}

export function formatDate(iso: string | null): string {
  if (!iso) return "-";
  return new Date(iso).toLocaleDateString("fr-FR", { dateStyle: "medium" });
}

/** Date du jour au format attendu par un <input type="date"> (heure locale). */
export function todayIso(): string {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}-${month}-${day}`;
}
