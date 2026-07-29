"use client";

import { useCallback, useEffect, useState } from "react";
import { Badge, Card, PageHeader } from "@/components/ui";
import { callTicket, completeTicket, fetchQueue } from "./queue-api";
import { SERVICE_LABELS, SERVICES, type Service, type Ticket } from "./types";

const STATUS_LABELS: Record<Ticket["statut"], string> = {
  en_attente: "En attente",
  appele: "Appelé",
  traite: "Traité",
  annule: "Annulé",
};

const STATUS_TONE: Record<Ticket["statut"], "primary" | "success" | "warning" | "danger"> = {
  en_attente: "warning",
  appele: "primary",
  traite: "success",
  annule: "danger",
};

export function QueueBoard() {
  const [service, setService] = useState<Service | "">("");
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [busyId, setBusyId] = useState<number | null>(null);

  const reload = useCallback(() => {
    fetchQueue(service || undefined).then((res) => setTickets(res.data));
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

  return (
    <div className="flex flex-col gap-4">
      <PageHeader title="File d'attente" />

      <div className="flex items-center gap-2 text-sm flex-wrap">
        <button
          onClick={() => setService("")}
          className={`rounded-full px-3 py-1.5 border transition-colors ${
            service === ""
              ? "border-primary bg-primary text-white"
              : "border-border bg-surface hover:bg-primary-light/60"
          }`}
        >
          Tous
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
            {SERVICE_LABELS[s]}
          </button>
        ))}
      </div>

      <Card className="p-0 overflow-hidden">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="text-left border-b border-border bg-primary-light/40">
              <th className="py-2.5 px-4 font-semibold text-foreground/90">Ticket</th>
              <th className="py-2.5 px-4 font-semibold text-foreground/90">Service</th>
              <th className="py-2.5 px-4 font-semibold text-foreground/90">Patient</th>
              <th className="py-2.5 px-4 font-semibold text-foreground/90">Statut</th>
              <th className="py-2.5 px-4"></th>
            </tr>
          </thead>
          <tbody>
            {tickets.map((ticket) => (
              <tr key={ticket.id} className="border-b border-border last:border-0 hover:bg-primary-light/40">
                <td className="py-2.5 px-4 font-semibold">{ticket.label}</td>
                <td className="py-2.5 px-4">{SERVICE_LABELS[ticket.service]}</td>
                <td className="py-2.5 px-4">
                  {ticket.patient.prenom} {ticket.patient.nom}
                </td>
                <td className="py-2.5 px-4">
                  <Badge tone={STATUS_TONE[ticket.statut]}>
                    {STATUS_LABELS[ticket.statut]}
                  </Badge>
                </td>
                <td className="py-2.5 px-4">
                  <div className="flex gap-2">
                    {ticket.statut === "en_attente" && (
                      <button
                        onClick={() => handleCall(ticket)}
                        disabled={busyId === ticket.id}
                        className="text-primary hover:underline disabled:opacity-50"
                      >
                        Appeler
                      </button>
                    )}
                    {ticket.statut === "appele" && (
                      <button
                        onClick={() => handleComplete(ticket)}
                        disabled={busyId === ticket.id}
                        className="text-primary hover:underline disabled:opacity-50"
                      >
                        Marquer traité
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {tickets.length === 0 && (
          <p className="text-sm text-muted p-4">File d&apos;attente vide.</p>
        )}
      </Card>
    </div>
  );
}
