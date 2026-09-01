"use client";

import { useState } from "react";
import { IconFileTypePdf } from "@tabler/icons-react";
import { Button, type ButtonProps } from "./Button";
import { downloadFile } from "@/lib/download";

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
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    setBusy(true);
    setError(null);
    try {
      await downloadFile(path, filename, "application/pdf");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Export impossible.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <span className="inline-flex flex-wrap items-center gap-x-2 gap-y-1">
      <Button
        variant={variant}
        size={size}
        onClick={handleClick}
        disabled={busy}
        className={className}
      >
        <IconFileTypePdf size={14} className="mr-1.5" />
        {busy ? "…" : label}
      </Button>
      {error && (
        <span className="max-w-xs text-xs text-danger" role="alert">
          {error}{" "}
          <button
            type="button"
            onClick={handleClick}
            className="font-semibold underline hover:no-underline"
          >
            Réessayer
          </button>
        </span>
      )}
    </span>
  );
}
