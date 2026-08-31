"use client";

import type { ReactNode } from "react";
import {
  IconDotsVertical,
  IconEye,
  IconPencil,
  IconTrash,
} from "@tabler/icons-react";
import { Dropdown, DropdownDivider, DropdownItem } from "./Dropdown";

export interface RowAction {
  label: string;
  href?: string;
  onClick?: () => void;
  icon?: ReactNode;
  tone?: "default" | "danger";
  dividerBefore?: boolean;
}

/* Cluster d'actions en fin de ligne de tableau (template : icône ti-dots-vertical
   bordée + dropdown-menu p-2 avec Voir / Modifier / Supprimer). */
export function RowActions({
  view,
  edit,
  onDelete,
  deleteLabel = "Supprimer",
  viewLabel = "Voir",
  editLabel = "Modifier",
  extra = [],
}: {
  view?: string | (() => void);
  edit?: string | (() => void);
  onDelete?: () => void;
  deleteLabel?: string;
  viewLabel?: string;
  editLabel?: string;
  extra?: RowAction[];
}) {
  return (
    <Dropdown
      align="end"
      width="sm"
      trigger={({ toggle }) => (
        <button
          type="button"
          onClick={toggle}
          className="inline-flex h-7 w-7 items-center justify-center rounded-[5px] border border-border text-muted shadow-[var(--shadow-preclinic-sm)] transition-colors hover:bg-light hover:text-heading"
          aria-label="Actions"
        >
          <IconDotsVertical size={15} />
        </button>
      )}
    >
      {view != null &&
        (typeof view === "string" ? (
          <DropdownItem icon={<IconEye size={15} />} href={view}>
            {viewLabel}
          </DropdownItem>
        ) : (
          <DropdownItem icon={<IconEye size={15} />} onClick={view}>
            {viewLabel}
          </DropdownItem>
        ))}
      {edit != null &&
        (typeof edit === "string" ? (
          <DropdownItem icon={<IconPencil size={15} />} href={edit}>
            {editLabel}
          </DropdownItem>
        ) : (
          <DropdownItem icon={<IconPencil size={15} />} onClick={edit}>
            {editLabel}
          </DropdownItem>
        ))}
      {extra.map((action, i) => (
        <div key={i}>
          {action.dividerBefore && <DropdownDivider />}
          <DropdownItem
            icon={action.icon}
            href={action.href}
            onClick={action.onClick}
            tone={action.tone}
          >
            {action.label}
          </DropdownItem>
        </div>
      ))}
      {onDelete && (
        <>
          <DropdownDivider />
          <DropdownItem
            icon={<IconTrash size={15} />}
            onClick={onDelete}
            tone="danger"
          >
            {deleteLabel}
          </DropdownItem>
        </>
      )}
    </Dropdown>
  );
}
