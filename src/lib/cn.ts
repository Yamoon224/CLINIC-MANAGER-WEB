/**
 * Concaténateur de classes minimal (pas de dépendance clsx/tailwind-merge).
 * Ignore les valeurs falsy, aplatit les tableaux.
 */
export function cn(
  ...parts: Array<string | false | null | undefined>
): string {
  return parts.filter(Boolean).join(" ");
}
