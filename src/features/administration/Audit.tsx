"use client";

import { useEffect, useState } from "react";
import { fetchAudit, fetchCausers } from "./administration-api";
import {
  AUDIT_EVENT_LABELS,
  AUDIT_SUBJECT_TYPES,
  type AuditCauser,
  type AuditEntry,
  type AuditEvent,
} from "./types";
import { Badge, Button, Card, Field, Input, Select } from "@/components/ui";

const AUDIT_EVENT_TONE: Record<AuditEvent, "success" | "primary" | "danger"> = {
  created: "success",
  updated: "primary",
  deleted: "danger",
};

export function Audit() {
  const [entries, setEntries] = useState<AuditEntry[]>([]);
  const [causers, setCausers] = useState<AuditCauser[]>([]);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [subjectType, setSubjectType] = useState("");
  const [causerId, setCauserId] = useState("");
  const [event, setEvent] = useState<AuditEvent | "">("");
  const [dateDebut, setDateDebut] = useState("");
  const [dateFin, setDateFin] = useState("");
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetchCausers()
      .then((res) => setCausers(res.data))
      .catch(() => setError(true));
  }, []);

  useEffect(() => {
    fetchAudit(
      {
        subject_type: subjectType || undefined,
        causer_id: causerId ? Number(causerId) : undefined,
        event: event || undefined,
        date_debut: dateDebut || undefined,
        date_fin: dateFin || undefined,
      },
      page,
    )
      .then((res) => {
        setEntries(res.data);
        setLastPage(res.meta.last_page);
      })
      .catch(() => setError(true));
  }, [subjectType, causerId, event, dateDebut, dateFin, page]);

  if (error) {
    return (
      <p className="text-sm text-muted">
        Journal d&apos;audit réservé au profil administrateur.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <Card className="flex flex-wrap gap-3">
        <Field label="Objet">
          <Select
            value={subjectType}
            onChange={(e) => {
              setPage(1);
              setSubjectType(e.target.value);
            }}
            className="w-44"
          >
            <option value="">Tous les objets</option>
            {AUDIT_SUBJECT_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Action">
          <Select
            value={event}
            onChange={(e) => {
              setPage(1);
              setEvent(e.target.value as AuditEvent | "");
            }}
            className="w-44"
          >
            <option value="">Toutes les actions</option>
            {Object.entries(AUDIT_EVENT_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Auteur">
          <Select
            value={causerId}
            onChange={(e) => {
              setPage(1);
              setCauserId(e.target.value);
            }}
            className="w-44"
          >
            <option value="">Tous les auteurs</option>
            {causers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Du">
          <Input
            type="date"
            value={dateDebut}
            onChange={(e) => {
              setPage(1);
              setDateDebut(e.target.value);
            }}
          />
        </Field>
        <Field label="Au">
          <Input
            type="date"
            value={dateFin}
            onChange={(e) => {
              setPage(1);
              setDateFin(e.target.value);
            }}
          />
        </Field>
      </Card>

      <Card className="p-0">
        <ul className="divide-y divide-border">
          {entries.map((entry) => (
            <li key={entry.id} className="p-3">
              <button
                onClick={() => setExpandedId(expandedId === entry.id ? null : entry.id)}
                className="flex w-full items-center justify-between gap-3 text-left"
              >
                <span className="flex flex-wrap items-center gap-2 text-sm">
                  <span className="text-xs text-muted">
                    {entry.created_at?.replace("T", " ").slice(0, 16)}
                  </span>
                  <span className="font-medium">{entry.causer?.name ?? "Système"}</span>
                  {entry.event && (
                    <Badge tone={AUDIT_EVENT_TONE[entry.event]}>
                      {AUDIT_EVENT_LABELS[entry.event]}
                    </Badge>
                  )}
                  <span className="text-muted">
                    {entry.subject_type}
                    {entry.subject_id !== null && ` #${entry.subject_id}`}
                  </span>
                </span>
                <span className="whitespace-nowrap text-xs font-medium text-primary">
                  {expandedId === entry.id ? "Masquer" : "Détails"}
                </span>
              </button>

              {expandedId === entry.id && (
                <div className="mt-3 grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <div className="mb-1 font-semibold text-foreground">Avant</div>
                    <pre className="overflow-x-auto rounded-lg bg-primary-light/40 p-2">
                      {entry.avant ? JSON.stringify(entry.avant, null, 2) : "-"}
                    </pre>
                  </div>
                  <div>
                    <div className="mb-1 font-semibold text-foreground">Après</div>
                    <pre className="overflow-x-auto rounded-lg bg-primary-light/40 p-2">
                      {entry.apres ? JSON.stringify(entry.apres, null, 2) : "-"}
                    </pre>
                  </div>
                </div>
              )}
            </li>
          ))}
          {entries.length === 0 && (
            <li className="p-3 text-sm text-muted">Aucune activité.</li>
          )}
        </ul>
      </Card>

      {lastPage > 1 && (
        <div className="flex items-center gap-3 text-sm">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
          >
            Précédent
          </Button>
          <span className="text-muted">
            Page {page} / {lastPage}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.min(lastPage, p + 1))}
            disabled={page >= lastPage}
          >
            Suivant
          </Button>
        </div>
      )}
    </div>
  );
}
