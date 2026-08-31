"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { IconCircleCheck, IconClock, IconPhoneCall } from "@tabler/icons-react";
import {
  Badge,
  Button,
  DataTable,
  PageHeader,
  StatCard,
  type Column,
  type Tone,
} from "@/components/ui";
import { cn } from "@/lib/cn";
import { useTranslation } from "@/lib/i18n/LanguageContext";
import { callTicket, completeTicket, fetchQueue } from "./queue-api";
import { SERVICES, type Service, type Ticket } from "./types";

const STATUS_TONE: Record<Ticket["statut"], Tone> = {
  en_attente: "warning",
  appele: "primary",
  traite: "success",
  annule: "danger",
};

export function QueueBoard() {
  const { t } = useTranslation();
  const [service, setService] = useState<Service | "">("");
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<number | null>(null);

  const reload = useCallback(() => {
    fetchQueue(service || undefined, page)
      .then((res) => {
        setTickets(res.data);
        setTotal(res.meta.total);
      })
      .finally(() => setLoading(false));
  }, [service, page]);

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

  const columns: Column<Ticket>[] = [
    {
      key: "ticket",
      header: t("queue.table.ticket"),
      className: "font-semibold text-heading",
      cell: (tk) => tk.label,
    },
    {
      key: "service",
      header: t("queue.table.service"),
      cell: (tk) => t(`queue.service.${tk.service}`),
    },
    {
      key: "patient",
      header: t("queue.table.patient"),
      cell: (tk) => `${tk.patient.prenom} ${tk.patient.nom}`,
    },
    {
      key: "statut",
      header: t("queue.table.statut"),
      cell: (tk) => (
        <Badge tone={STATUS_TONE[tk.statut]} border>
          {t(`queue.statut.${tk.statut}`)}
        </Badge>
      ),
    },
    {
      key: "actions",
      header: "",
      className: "text-right",
      headClassName: "text-right",
      cell: (tk) => (
        <div className="flex justify-end">
          {tk.statut === "en_attente" && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleCall(tk)}
              disabled={busyId === tk.id}
            >
              {t("queue.call")}
            </Button>
          )}
          {tk.statut === "appele" && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleComplete(tk)}
              disabled={busyId === tk.id}
            >
              {t("queue.markDone")}
            </Button>
          )}
        </div>
      ),
    },
  ];

  const serviceOptions: (Service | "")[] = ["", ...SERVICES];

  return (
    <div className="flex flex-col gap-4">
      <PageHeader title={t("queue.title")} total={total} />

      <div className="grid grid-cols-3 gap-4">
        <StatCard
          icon={<IconClock size={18} />}
          label={t("queue.statut.en_attente")}
          value={counts.en_attente}
          tone="warning"
        />
        <StatCard
          icon={<IconPhoneCall size={18} />}
          label={t("queue.statut.appele")}
          value={counts.appele}
          tone="primary"
        />
        <StatCard
          icon={<IconCircleCheck size={18} />}
          label={t("queue.statut.traite")}
          value={counts.traite}
          tone="success"
        />
      </div>

      <div className="flex flex-wrap items-center gap-2 text-sm">
        {serviceOptions.map((s) => (
          <button
            key={s || "all"}
            onClick={() => {
              setService(s);
              setPage(1);
            }}
            className={cn(
              "rounded-full border px-3 py-1.5 transition-colors",
              service === s
                ? "border-primary bg-primary text-white"
                : "border-border bg-surface text-muted hover:bg-light",
            )}
          >
            {s === "" ? t("queue.all") : t(`queue.service.${s}`)}
          </button>
        ))}
      </div>

      <DataTable
        columns={columns}
        rows={tickets}
        getRowKey={(tk) => tk.id}
        page={page}
        perPage={15}
        total={total}
        onPageChange={setPage}
        loading={loading}
        emptyLabel={t("queue.empty")}
      />
    </div>
  );
}
