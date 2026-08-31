"use client";

import { Fragment, useEffect, useState } from "react";
import { fetchAudit, fetchCausers } from "./administration-api";
import {
  AUDIT_SUBJECT_TYPES,
  type AuditCauser,
  type AuditEntry,
  type AuditEvent,
} from "./types";
import { Badge, Card, DateInput, Field, Pagination, Select } from "@/components/ui";
import { useTranslation } from "@/lib/i18n/LanguageContext";

const AUDIT_EVENT_TONE: Record<AuditEvent, "success" | "primary" | "danger"> = {
  created: "success",
  updated: "primary",
  deleted: "danger",
};

export function Audit() {
  const { t } = useTranslation();
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

  const AUDIT_EVENT_LABELS: Record<AuditEvent, string> = {
    created: t("audit.event.created"),
    updated: t("audit.event.updated"),
    deleted: t("audit.event.deleted"),
  };

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
    return <p className="text-sm text-muted">{t("audit.accessDenied")}</p>;
  }

  return (
    <div className="flex flex-col gap-4">
      <Card className="flex flex-wrap gap-3">
        <Field label={t("audit.filters.objet")}>
          <Select
            value={subjectType}
            onChange={(e) => {
              setPage(1);
              setSubjectType(e.target.value);
            }}
            className="w-44"
          >
            <option value="">{t("audit.filters.tousObjets")}</option>
            {AUDIT_SUBJECT_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </Select>
        </Field>
        <Field label={t("audit.filters.action")}>
          <Select
            value={event}
            onChange={(e) => {
              setPage(1);
              setEvent(e.target.value as AuditEvent | "");
            }}
            className="w-44"
          >
            <option value="">{t("audit.filters.toutesActions")}</option>
            {Object.entries(AUDIT_EVENT_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
        </Field>
        <Field label={t("audit.filters.auteur")}>
          <Select
            value={causerId}
            onChange={(e) => {
              setPage(1);
              setCauserId(e.target.value);
            }}
            className="w-44"
          >
            <option value="">{t("audit.filters.tousAuteurs")}</option>
            {causers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </Select>
        </Field>
        <Field label={t("audit.filters.du")}>
          <DateInput
            value={dateDebut}
            onChange={(e) => {
              setPage(1);
              setDateDebut(e.target.value);
            }}
          />
        </Field>
        <Field label={t("audit.filters.au")}>
          <DateInput
            value={dateFin}
            onChange={(e) => {
              setPage(1);
              setDateFin(e.target.value);
            }}
          />
        </Field>
      </Card>

      <Card className="overflow-hidden p-0">
        <table className="table">
          <thead>
            <tr>
              <th>{t("audit.table.date")}</th>
              <th>{t("audit.table.auteur")}</th>
              <th>{t("audit.table.action")}</th>
              <th>{t("audit.table.objet")}</th>
              <th>{t("audit.table.details")}</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((entry) => (
              <Fragment key={entry.id}>
                <tr>
                  <td className="whitespace-nowrap text-xs text-muted">
                    {entry.created_at?.replace("T", " ").slice(0, 16)}
                  </td>
                  <td>{entry.causer?.name ?? t("audit.systeme")}</td>
                  <td>
                    {entry.event && (
                      <Badge tone={AUDIT_EVENT_TONE[entry.event]}>
                        {AUDIT_EVENT_LABELS[entry.event]}
                      </Badge>
                    )}
                  </td>
                  <td className="text-muted">
                    {entry.subject_type}
                    {entry.subject_id !== null && ` #${entry.subject_id}`}
                  </td>
                  <td>
                    <button
                      onClick={() => setExpandedId(expandedId === entry.id ? null : entry.id)}
                      className="whitespace-nowrap text-xs font-medium text-primary"
                    >
                      {expandedId === entry.id ? t("audit.masquer") : t("audit.detailsBtn")}
                    </button>
                  </td>
                </tr>
                {expandedId === entry.id && (
                  <tr key={`${entry.id}-details`}>
                    <td colSpan={5}>
                      <div className="grid grid-cols-2 gap-4 text-xs py-2">
                        <div>
                          <div className="mb-1 font-semibold text-heading">
                            {t("audit.avant")}
                          </div>
                          <pre className="overflow-x-auto rounded-[5px] bg-light p-2">
                            {entry.avant ? JSON.stringify(entry.avant, null, 2) : "-"}
                          </pre>
                        </div>
                        <div>
                          <div className="mb-1 font-semibold text-heading">
                            {t("audit.apres")}
                          </div>
                          <pre className="overflow-x-auto rounded-[5px] bg-light p-2">
                            {entry.apres ? JSON.stringify(entry.apres, null, 2) : "-"}
                          </pre>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </Fragment>
            ))}
          </tbody>
        </table>
        {entries.length === 0 && (
          <p className="p-3 text-sm text-muted">{t("audit.noActivity")}</p>
        )}
      </Card>

      <Pagination page={page} totalPages={lastPage} onPageChange={setPage} />
    </div>
  );
}
