import { cloneElement, isValidElement } from "react";
import type { ReactElement, ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Input } from "./Input";
import { Textarea } from "./Textarea";
import { PasswordInput } from "./PasswordInput";

/* Contrôles qui acceptent un placeholder texte — si aucun n'est fourni,
   Field injecte automatiquement un placeholder dérivé du label. */
const PLACEHOLDER_TYPES: unknown[] = [Input, Textarea, PasswordInput];

type WithPlaceholder = { placeholder?: string; type?: string };

/* Champ de formulaire au format "stacked" du template :
   label.form-label (13px / medium / heading) + astérisque danger + contrôle + hint. */
export function Field({
  label,
  required,
  hint,
  error,
  htmlFor,
  className,
  full = false,
  placeholder,
  children,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  error?: string | null;
  htmlFor?: string;
  className?: string;
  /** Occupe toute la largeur de la grille (col-span-2) — évite les demi-lignes vides. */
  full?: boolean;
  /** Placeholder explicite ; sinon le label est utilisé. */
  placeholder?: string;
  children: ReactNode;
}) {
  let control = children;

  if (isValidElement(children) && PLACEHOLDER_TYPES.includes(children.type)) {
    const el = children as ReactElement<WithPlaceholder>;
    const nativeType = el.props.type;
    // Les inputs date/time/month natifs ignorent le placeholder.
    const supportsPlaceholder =
      !nativeType || ["text", "search", "email", "tel", "url", "number", "password"].includes(nativeType);
    if (supportsPlaceholder && el.props.placeholder === undefined) {
      control = cloneElement(el, { placeholder: placeholder ?? label });
    }
  }

  return (
    <div
      className={cn("flex flex-col gap-1.5", full && "col-span-full", className)}
    >
      <label htmlFor={htmlFor} className="text-[13px] font-medium text-heading">
        {label}
        {required && <span className="ms-1 text-danger">*</span>}
      </label>
      {control}
      {error ? (
        <span className="text-xs text-danger">{error}</span>
      ) : hint ? (
        <span className="text-xs text-muted">{hint}</span>
      ) : null}
    </div>
  );
}
