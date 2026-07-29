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
      <p className="text-gray-500">
        Journal d&apos;audit réservé au profil administrateur.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-2">
        <select
          value={subjectType}
          onChange={(e) => {
            setPage(1);
            setSubjectType(e.target.value);
          }}
          className="border rounded px-3 py-2"
        >
          <option value="">Tous les objets</option>
          {AUDIT_SUBJECT_TYPES.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
        <select
          value={event}
          onChange={(e) => {
            setPage(1);
            setEvent(e.target.value as AuditEvent | "");
          }}
          className="border rounded px-3 py-2"
        >
          <option value="">Toutes les actions</option>
          {Object.entries(AUDIT_EVENT_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
        <select
          value={causerId}
          onChange={(e) => {
            setPage(1);
            setCauserId(e.target.value);
          }}
          className="border rounded px-3 py-2"
        >
          <option value="">Tous les auteurs</option>
          {causers.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <input
          type="date"
          value={dateDebut}
          onChange={(e) => {
            setPage(1);
            setDateDebut(e.target.value);
          }}
          className="border rounded px-3 py-2"
        />
        <input
          type="date"
          value={dateFin}
          onChange={(e) => {
            setPage(1);
            setDateFin(e.target.value);
          }}
          className="border rounded px-3 py-2"
        />
      </div>

      <ul className="flex flex-col gap-1 text-sm">
        {entries.map((entry) => (
          <li key={entry.id} className="border rounded p-2">
            <button
              onClick={() => setExpandedId(expandedId === entry.id ? null : entry.id)}
              className="w-full flex items-center justify-between text-left"
            >
              <span>
                <span className="text-gray-500">{entry.created_at?.replace("T", " ").slice(0, 16)}</span>
                {" — "}
                <span className="font-medium">{entry.causer?.name ?? "Système"}</span>
                {" — "}
                {entry.event ? AUDIT_EVENT_LABELS[entry.event] : entry.event}
                {" "}
                {entry.subject_type}
                {entry.subject_id !== null && ` #${entry.subject_id}`}
              </span>
              <span className="text-xs text-blue-600 underline">
                {expandedId === entry.id ? "Masquer" : "Détails"}
              </span>
            </button>

            {expandedId === entry.id && (
              <div className="mt-2 grid grid-cols-2 gap-4 text-xs">
                <div>
                  <div className="font-semibold mb-1">Avant</div>
                  <pre className="bg-gray-50 rounded p-2 overflow-x-auto">
                    {entry.avant ? JSON.stringify(entry.avant, null, 2) : "—"}
                  </pre>
                </div>
                <div>
                  <div className="font-semibold mb-1">Après</div>
                  <pre className="bg-gray-50 rounded p-2 overflow-x-auto">
                    {entry.apres ? JSON.stringify(entry.apres, null, 2) : "—"}
                  </pre>
                </div>
              </div>
            )}
          </li>
        ))}
        {entries.length === 0 && <li className="text-gray-500">Aucune activité.</li>}
      </ul>

      {lastPage > 1 && (
        <div className="flex items-center gap-2 text-sm">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
            className="border rounded px-2 py-1 disabled:opacity-50"
          >
            Précédent
          </button>
          <span>
            Page {page} / {lastPage}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(lastPage, p + 1))}
            disabled={page >= lastPage}
            className="border rounded px-2 py-1 disabled:opacity-50"
          >
            Suivant
          </button>
        </div>
      )}
    </div>
  );
}
