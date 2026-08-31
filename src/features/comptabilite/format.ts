export function fcfa(value: string | number | null | undefined): string {
  const n = typeof value === "string" ? Number(value) : (value ?? 0);
  if (Number.isNaN(n)) return "—";
  return `${n.toLocaleString("fr-FR", { maximumFractionDigits: 0 })} F CFA`;
}

export function formatMonth(iso: string): string {
  return new Date(iso).toLocaleDateString("fr-FR", {
    month: "long",
    year: "numeric",
  });
}

export function formatDate(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("fr-FR", { dateStyle: "medium" });
}
