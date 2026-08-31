"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";
import { IconTrash } from "@tabler/icons-react";
import { Button } from "./Button";

/* Modale de confirmation de suppression brandée (delete_modal du template) :
   avatar danger + titre + message + Annuler / Oui, supprimer. */
export function ConfirmDeleteModal({
  open,
  onClose,
  onConfirm,
  title = "Confirmation de suppression",
  message = "Êtes-vous sûr de vouloir supprimer cet élément ?",
  confirmLabel = "Oui, supprimer",
  cancelLabel = "Annuler",
  busy = false,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  busy?: boolean;
}) {
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape" && !busy) onClose();
    }
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose, busy]);

  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4">
      <div className="absolute inset-0" onClick={() => !busy && onClose()} aria-hidden="true" />
      <div
        role="alertdialog"
        aria-modal="true"
        className="relative w-full max-w-sm overflow-hidden rounded-[6px] border border-border bg-surface p-6 text-center shadow-[var(--shadow-preclinic-lg)]"
      >
        <div className="mb-3 flex justify-center">
          <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-danger text-white">
            <IconTrash size={22} />
          </span>
        </div>
        <h5 className="m-0 mb-1 text-base font-bold text-heading">{title}</h5>
        <p className="m-0 mb-4 text-sm text-muted">{message}</p>
        <div className="flex justify-center gap-3">
          <Button variant="light" onClick={onClose} disabled={busy}>
            {cancelLabel}
          </Button>
          <Button variant="danger" onClick={onConfirm} disabled={busy}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
