type Tone = "primary" | "accent" | "success" | "warning" | "danger" | "neutral";

const TONE_CLASSES: Record<Tone, string> = {
  primary: "bg-primary-light text-primary",
  accent: "bg-accent-light text-accent",
  success: "bg-success-light text-success",
  warning: "bg-warning-light text-warning",
  danger: "bg-danger-light text-danger",
  neutral: "bg-foreground/5 text-muted",
};

export function Badge({
  tone = "neutral",
  children,
}: {
  tone?: Tone;
  children: React.ReactNode;
}) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${TONE_CLASSES[tone]}`}
    >
      {children}
    </span>
  );
}
