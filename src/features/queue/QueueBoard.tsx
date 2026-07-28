"use client";

import { useCallback, useEffect, useState } from "react";
import { callTicket, completeTicket, fetchQueue } from "./queue-api";
import { SERVICE_LABELS, SERVICES, type Service, type Ticket } from "./types";

const STATUS_LABELS: Record<Ticket["statut"], string> = {
  en_attente: "En attente",
  appele: "Appelé",
  traite: "Traité",
  annule: "Annulé",
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
      <div className="flex items-center gap-2 text-sm">
        <button
          onClick={() => setService("")}
          className={`px-3 py-1 rounded border ${service === "" ? "bg-blue-600 text-white" : ""}`}
        >
          Tous
        </button>
        {SERVICES.map((s) => (
          <button
            key={s}
            onClick={() => setService(s)}
            className={`px-3 py-1 rounded border ${service === s ? "bg-blue-600 text-white" : ""}`}
          >
            {SERVICE_LABELS[s]}
          </button>
        ))}
      </div>

      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="text-left border-b">
            <th className="py-2 pr-4">Ticket</th>
            <th className="py-2 pr-4">Service</th>
            <th className="py-2 pr-4">Patient</th>
            <th className="py-2 pr-4">Statut</th>
            <th className="py-2 pr-4"></th>
          </tr>
        </thead>
        <tbody>
          {tickets.map((ticket) => (
            <tr key={ticket.id} className="border-b">
              <td className="py-2 pr-4 font-semibold">{ticket.label}</td>
              <td className="py-2 pr-4">{SERVICE_LABELS[ticket.service]}</td>
              <td className="py-2 pr-4">
                {ticket.patient.prenom} {ticket.patient.nom}
              </td>
              <td className="py-2 pr-4">{STATUS_LABELS[ticket.statut]}</td>
              <td className="py-2 pr-4 flex gap-2">
                {ticket.statut === "en_attente" && (
                  <button
                    onClick={() => handleCall(ticket)}
                    disabled={busyId === ticket.id}
                    className="underline disabled:opacity-50"
                  >
                    Appeler
                  </button>
                )}
                {ticket.statut === "appele" && (
                  <button
                    onClick={() => handleComplete(ticket)}
                    disabled={busyId === ticket.id}
                    className="underline disabled:opacity-50"
                  >
                    Marquer traité
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {tickets.length === 0 && (
        <p className="text-sm text-gray-500">File d&apos;attente vide.</p>
      )}
    </div>
  );
}
