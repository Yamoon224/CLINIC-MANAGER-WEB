"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { Badge, Card, Input, PageHeader, Pagination } from "@/components/ui";
import { useTranslation } from "@/lib/i18n/LanguageContext";
import { changerStatutRendezVous, fetchAgenda } from "./rendezvous-api";
import type { RendezVous, RendezVousStatut } from "./types";

const NEXT_STATUS: Partial<Record<RendezVous["statut"], RendezVous["statut"]>> = {
  programme: "confirme",
  confirme: "arrive",
  arrive: "en_consultation",
  en_consultation: "honore",
};

const STATUT_TONE: Record<RendezVousStatut, "primary" | "accent" | "success" | "warning" | "danger" | "neutral"> = {
  programme: "neutral",
  confirme: "primary",
  arrive: "warning",
  en_consultation: "accent",
  honore: "success",
  absent: "danger",
  annule: "danger",
  reporte: "warning",
};

export function AgendaBoard() {
  const { t } = useTranslation();
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [rendezVous, setRendezVous] = useState<RendezVous[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [busyId, setBusyId] = useState<number | null>(null);

  const reload = useCallback(() => {
    fetchAgenda(date, page).then((res) => {
      setRendezVous(res.data);
      setTotalPages(res.meta.last_page);
    });
  }, [date, page]);

  useEffect(() => {
    setPage(1);
  }, [date]);

  useEffect(() => {
    reload();
  }, [reload]);

  async function handleAdvance(rdv: RendezVous) {
    const next = NEXT_STATUS[rdv.statut];
    if (!next) return;
    setBusyId(rdv.id);
    try {
      await changerStatutRendezVous(rdv.id, next);
      reload();
    } finally {
      setBusyId(null);
    }
  }

  async function handleCancel(rdv: RendezVous) {
    setBusyId(rdv.id);
    try {
      await changerStatutRendezVous(rdv.id, "annule");
      reload();
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title={t("rendezvous.title")}
        actions={
          <Link
            href="/rendez-vous/new"
            className="inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white shadow-sm shadow-primary/20 transition-colors hover:bg-primary-hover"
          >
            + {t("rendezvous.newRendezVous")}
          </Link>
        }
      />

      <Input
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        className="max-w-xs"
      />

      <Card className="p-0 overflow-hidden">
        <table className="table">
          <thead>
            <tr>
              <th>{t("rendezvous.table.heure")}</th>
              <th>{t("rendezvous.table.patient")}</th>
              <th>{t("rendezvous.table.praticien")}</th>
              <th>{t("rendezvous.table.type")}</th>
              <th>{t("rendezvous.table.statut")}</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {rendezVous.map((rdv) => (
              <tr key={rdv.id}>
                <td>
                  {new Date(rdv.starts_at).toLocaleTimeString("fr-FR", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </td>
                <td>
                  {rdv.patient.prenom} {rdv.patient.nom}
                </td>
                <td>{rdv.praticien.name}</td>
                <td>{t(`rendezvous.type.${rdv.type}`)}</td>
                <td>
                  <Badge tone={STATUT_TONE[rdv.statut]}>
                    {t(`rendezvous.statut.${rdv.statut}`)}
                  </Badge>
                </td>
                <td>
                  <div className="flex gap-3">
                    {NEXT_STATUS[rdv.statut] && (
                      <button
                        onClick={() => handleAdvance(rdv)}
                        disabled={busyId === rdv.id}
                        className="text-primary hover:underline disabled:opacity-50"
                      >
                        {t(`rendezvous.statut.${NEXT_STATUS[rdv.statut]!}`)}
                      </button>
                    )}
                    {!["honore", "annule", "absent"].includes(rdv.statut) && (
                      <button
                        onClick={() => handleCancel(rdv)}
                        disabled={busyId === rdv.id}
                        className="text-danger hover:underline disabled:opacity-50"
                      >
                        {t("rendezvous.cancel")}
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {rendezVous.length === 0 && (
          <p className="text-sm text-muted p-4">{t("rendezvous.noResults")}</p>
        )}
      </Card>
      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
    </div>
  );
}
