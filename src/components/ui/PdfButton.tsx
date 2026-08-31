"use client";

import { useState } from "react";
import { IconFileTypePdf } from "@tabler/icons-react";
import { Button, type ButtonProps } from "./Button";
import { openPdf } from "@/lib/pdf";

export function PdfButton({
  path,
  label,
  filename = "document.pdf",
  variant = "outline",
  size = "sm",
  className = "",
}: {
  path: string;
  label: string;
  filename?: string;
  variant?: ButtonProps["variant"];
  size?: ButtonProps["size"];
  className?: string;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(false);

  async function handleClick() {
    setBusy(true);
    setError(false);
    try {
      await openPdf(path, filename);
    } catch {
      setError(true);
    } finally {
      setBusy(false);
    }
  }

  return (
    <span className="inline-flex items-center gap-2">
      <Button variant={variant} size={size} onClick={handleClick} disabled={busy} className={className}>
        <IconFileTypePdf size={14} className="mr-1.5" />
        {busy ? "…" : label}
      </Button>
      {error && <span className="text-xs text-danger">Export impossible</span>}
    </span>
  );
}
