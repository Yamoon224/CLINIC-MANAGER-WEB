"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Clock, PhoneCall, CheckCircle2, type LucideIcon } from "lucide-react";
import { Badge, Card, PageHeader, Pagination } from "@/components/ui";
import { useTranslation } from "@/lib/i18n/LanguageContext";
import { callTicket, completeTicket, fetchQueue } from "./queue-api";
import { SERVICES, type Service, type Ticket } from "./types";

const STATUS_TONE: Record<Ticket["statut"], "primary" | "success" | "warning" | "danger"> = {
  en_attente: "warning",
  appele: "primary",
  traite: "success",
  annule: "danger",
};

const STAT_ICON: Record<"en_attente" | "appele" | "traite", LucideIcon> = {
  en_attente: Clock,
  appele: PhoneCall,
  traite: CheckCircle2,
};

const STAT_CHIP: Record<"en_attente" | "appele" | "traite", string> = {
  en_attente: "bg-warning-light text-warning",
  appele: "bg-primary-light text-primary",
  traite: "bg-success-light text-success",
};

const STAT_TEXT: Record<"en_attente" | "appele" | "traite", string> = {
  en_attente: "text-warning",
  appele: "text-primary",
  traite: "text-success",
};

export function QueueBoard() {
  const { t } = useTranslation();
  const [service, setService] = useState<Service | "">("");
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [busyId, setBusyId] = useState<number | null>(null);

  const reload = useCallback(() => {
    fetchQueue(service || undefined, page).then((res) => {
      setTickets(res.data);
      setTotalPages(res.meta.last_page);
    });
  }, [service, page]);

  useEffect(() => {
    setPage(1);
  }, [service]);

  useEffect(() => {
    reload();
    const interval = setInterval(reload, 5000);
    return () => clearInterval(interval);
  }, [reload]);

  async function handleCall(ticket: Ticket) {
    setBusyId(ticket.id);
    try {
      await callTicket(ticket.id);
      reload();
    } finally {
      setBusyId(null);
    }
  }

  async function handleComplete(ticket: Ticket) {
    setBusyId(ticket.id);
    try {
      await completeTicket(ticket.id);
      reload();
    } finally {
      setBusyId(null);
    }
  }

  const counts = useMemo(
    () => ({
      en_attente: tickets.filter((tk) => tk.statut === "en_attente").length,
      appele: tickets.filter((tk) => tk.statut === "appele").length,
      traite: tickets.filter((tk) => tk.statut === "traite").length,
    }),
    [tickets],
  );

  return (
    <div className="flex flex-col gap-4">
      <PageHeader title={t("queue.title")} />

      <div className="grid grid-cols-3 gap-4">
        {(["en_attente", "appele", "traite"] as const).map((key) => {
          const Icon = STAT_ICON[key];
          return (
            <Card key={key} className="flex items-start gap-3 p-4">
              <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${STAT_CHIP[key]}`}>
                <Icon size={18} />
              </span>
              <div className="min-w-0">
                <div className="text-xs font-medium text-muted">{t(`queue.statut.${key}`)}</div>
                <div className={`mt-1 text-2xl font-semibold ${STAT_TEXT[key]}`}>{counts[key]}</div>
              </div>
            </Card>
          );
        })}
      </div>

      <div className="flex items-center gap-2 text-sm flex-wrap">
        <button
          onClick={() => setService("")}
          className={`rounded-full px-3 py-1.5 border transition-colors ${
            service === ""
              ? "border-primary bg-primary text-white"
              : "border-border bg-surface hover:bg-primary-light/60"
          }`}
        >
          {t("queue.all")}
        </button>
        {SERVICES.map((s) => (
          <button
            key={s}
            onClick={() => setService(s)}
            className={`rounded-full px-3 py-1.5 border transition-colors ${
              service === s
                ? "border-primary bg-primary text-white"
                : "border-border bg-surface hover:bg-primary-light/60"
            }`}
          >
            {t(`queue.service.${s}`)}
          </button>
        ))}
      </div>

      <Card className="p-0 overflow-hidden">
        <table className="table">
          <thead>
            <tr>
              <th>{t("queue.table.ticket")}</th>
              <th>{t("queue.table.service")}</th>
              <th>{t("queue.table.patient")}</th>
              <th>{t("queue.table.statut")}</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {tickets.map((ticket) => (
              <tr key={ticket.id}>
                <td className="font-semibold">{ticket.label}</td>
                <td>{t(`queue.service.${ticket.service}`)}</td>
                <td>
                  {ticket.patient.prenom} {ticket.patient.nom}
                </td>
                <td>
                  <Badge tone={STATUS_TONE[ticket.statut]}>
                    {t(`queue.statut.${ticket.statut}`)}
                  </Badge>
                </td>
                <td>
                  <div className="flex gap-2">
                    {ticket.statut === "en_attente" && (
                      <button
                        onClick={() => handleCall(ticket)}
                        disabled={busyId === ticket.id}
                        className="text-primary hover:underline disabled:opacity-50"
                      >
                        {t("queue.call")}
                      </button>
                    )}
                    {ticket.statut === "appele" && (
                      <button
                        onClick={() => handleComplete(ticket)}
                        disabled={busyId === ticket.id}
                        className="text-primary hover:underline disabled:opacity-50"
                      >
                        {t("queue.markDone")}
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {tickets.length === 0 && (
          <p className="text-sm text-muted p-4">{t("queue.empty")}</p>
        )}
      </Card>
      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
    </div>
  );
}
