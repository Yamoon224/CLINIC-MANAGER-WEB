"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Calendar,
  CalendarCheck,
  CalendarClock,
  CalendarX,
  ChevronLeft,
  ChevronRight,
  type LucideIcon,
} from "lucide-react";
import { Badge, Button, Card, Modal, PageHeader, TONE_CLASSES, type Tone } from "@/components/ui";
import { useTranslation } from "@/lib/i18n/LanguageContext";
import { addMonths, buildMonthGrid, startOfMonth, toISODate } from "@/lib/calendar";
import { changerStatutRendezVous, fetchAgenda } from "./rendezvous-api";
import { RendezVousForm } from "./RendezVousForm";
import type { RendezVous, RendezVousStatut } from "./types";

const NEXT_STATUS: Partial<Record<RendezVous["statut"], RendezVous["statut"]>> = {
  programme: "confirme",
  confirme: "arrive",
  arrive: "en_consultation",
  en_consultation: "honore",
};

const STATUT_TONE: Record<RendezVousStatut, Tone> = {
  programme: "neutral",
  confirme: "primary",
  arrive: "warning",
  en_consultation: "accent",
  honore: "success",
  absent: "danger",
  annule: "danger",
  reporte: "warning",
};

const A_VENIR_STATUTS: RendezVousStatut[] = [
  "programme",
  "confirme",
  "arrive",
  "en_consultation",
  "reporte",
];

type StatKey = "total" | "honore" | "aVenir" | "annuleAbsent";

const STAT_ICON: Record<StatKey, LucideIcon> = {
  total: Calendar,
  honore: CalendarCheck,
  aVenir: CalendarClock,
  annuleAbsent: CalendarX,
};

const STAT_CHIP: Record<StatKey, string> = {
  total: "bg-foreground/5 text-muted",
  honore: "bg-success-light text-success",
  aVenir: "bg-primary-light text-primary",
  annuleAbsent: "bg-danger-light text-danger",
};

const STAT_TEXT: Record<StatKey, string> = {
  total: "text-foreground",
  honore: "text-success",
  aVenir: "text-primary",
  annuleAbsent: "text-danger",
};

export function AgendaBoard() {
  const { t, locale } = useTranslation();
  const [monthCursor, setMonthCursor] = useState(() => startOfMonth(new Date()));
  const [rendezVous, setRendezVous] = useState<RendezVous[]>([]);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formDate, setFormDate] = useState<string | undefined>(undefined);
  const [dayDetail, setDayDetail] = useState<string | null>(null);

  const days = useMemo(() => buildMonthGrid(monthCursor), [monthCursor]);
  const gridStart = days[0];
  const gridEnd = days[days.length - 1];

  function load() {
    fetchAgenda(toISODate(gridStart), 1, undefined, toISODate(gridEnd), 300).then((res) => {
      setRendezVous(res.data);
    });
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [monthCursor]);

  async function handleAdvance(rdv: RendezVous) {
    const next = NEXT_STATUS[rdv.statut];
    if (!next) return;
    setBusyId(rdv.id);
    try {
      await changerStatutRendezVous(rdv.id, next);
      load();
    } finally {
      setBusyId(null);
    }
  }

  async function handleCancel(rdv: RendezVous) {
    setBusyId(rdv.id);
    try {
      await changerStatutRendezVous(rdv.id, "annule");
      load();
    } finally {
      setBusyId(null);
    }
  }

  const entriesByDay = useMemo(() => {
    const map = new Map<string, RendezVous[]>();
    for (const rdv of rendezVous) {
      const key = toISODate(new Date(rdv.starts_at));
      const list = map.get(key) ?? [];
      list.push(rdv);
      map.set(key, list);
    }
    return map;
  }, [rendezVous]);

  const monthLabel = new Intl.DateTimeFormat(locale, { month: "long", year: "numeric" }).format(monthCursor);
  const weekdayLabels = useMemo(() => {
    const formatter = new Intl.DateTimeFormat(locale, { weekday: "short" });
    return days.slice(0, 7).map((day) => formatter.format(day));
  }, [days, locale]);
  const dayDetailEntries = dayDetail ? entriesByDay.get(dayDetail) ?? [] : [];
  const today = toISODate(new Date());

  const stats: Record<StatKey, number> = useMemo(
    () => ({
      total: rendezVous.length,
      honore: rendezVous.filter((rdv) => rdv.statut === "honore").length,
      aVenir: rendezVous.filter((rdv) => A_VENIR_STATUTS.includes(rdv.statut)).length,
      annuleAbsent: rendezVous.filter((rdv) => rdv.statut === "annule" || rdv.statut === "absent")
        .length,
    }),
    [rendezVous],
  );

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title={t("rendezvous.title")}
        actions={
          <Button
            onClick={() => {
              setFormDate(undefined);
              setShowForm(true);
            }}
          >
            + {t("rendezvous.newRendezVous")}
          </Button>
        }
      />

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {(
          [
            ["total", t("rendezvous.stats.totalMois")],
            ["honore", t("rendezvous.stats.honores")],
            ["aVenir", t("rendezvous.stats.aVenir")],
            ["annuleAbsent", t("rendezvous.stats.annulesAbsents")],
          ] as [StatKey, string][]
        ).map(([key, label]) => {
          const Icon = STAT_ICON[key];
          return (
            <Card key={key} className="flex items-start gap-3 p-4">
              <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${STAT_CHIP[key]}`}>
                <Icon size={18} />
              </span>
              <div className="min-w-0">
                <div className="text-xs font-medium text-muted">{label}</div>
                <div className={`mt-1 text-2xl font-semibold ${STAT_TEXT[key]}`}>{stats[key]}</div>
              </div>
            </Card>
          );
        })}
      </div>

      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={() => setMonthCursor((m) => addMonths(m, -1))}>
          <ChevronLeft size={16} />
        </Button>
        <span className="min-w-[10rem] text-center text-sm font-semibold capitalize">{monthLabel}</span>
        <Button variant="outline" size="sm" onClick={() => setMonthCursor((m) => addMonths(m, 1))}>
          <ChevronRight size={16} />
        </Button>
        <Button variant="ghost" size="sm" onClick={() => setMonthCursor(startOfMonth(new Date()))}>
          {t("rendezvous.today")}
        </Button>
      </div>

      <Card className="overflow-hidden p-0">
        <div className="grid grid-cols-7 border-b border-border bg-primary-light/30">
          {weekdayLabels.map((label) => (
            <div key={label} className="px-2 py-2 text-center text-xs font-medium capitalize text-muted">
              {label}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7">
          {days.map((day) => {
            const key = toISODate(day);
            const dayEntries = (entriesByDay.get(key) ?? []).slice().sort((a, b) => a.starts_at.localeCompare(b.starts_at));
            const inMonth = day.getMonth() === monthCursor.getMonth();
            const isToday = key === today;
            return (
              <button
                type="button"
                key={key}
                onClick={() => setDayDetail(key)}
                className={`flex min-h-24 flex-col items-stretch gap-1 border-b border-r border-border p-1.5 text-left last:border-r-0 hover:bg-primary-light/40 ${
                  inMonth ? "bg-surface" : "bg-foreground/[0.02] text-muted"
                }`}
              >
                <span
                  className={`text-xs font-medium ${
                    isToday
                      ? "inline-flex h-5 w-5 items-center justify-center rounded-full bg-primary text-white"
                      : ""
                  }`}
                >
                  {day.getDate()}
                </span>
                <div className="flex flex-col gap-0.5">
                  {dayEntries.slice(0, 3).map((rdv) => (
                    <span
                      key={rdv.id}
                      className={`truncate rounded px-1 py-0.5 text-[10px] font-medium ${TONE_CLASSES[STATUT_TONE[rdv.statut]]}`}
                    >
                      {new Date(rdv.starts_at).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}{" "}
                      {rdv.patient.prenom} {rdv.patient.nom}
                    </span>
                  ))}
                  {dayEntries.length > 3 && (
                    <span className="text-[10px] text-muted">+{dayEntries.length - 3}</span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </Card>

      <Modal
        open={showForm}
        onClose={() => setShowForm(false)}
        title={t("rendezvous.newRendezVous")}
        size="lg"
      >
        <RendezVousForm
          initialDate={formDate}
          onCancel={() => setShowForm(false)}
          onCreated={() => {
            setShowForm(false);
            load();
          }}
        />
      </Modal>

      <Modal
        open={dayDetail !== null}
        onClose={() => setDayDetail(null)}
        title={
          dayDetail
            ? new Intl.DateTimeFormat(locale, { dateStyle: "full" }).format(new Date(`${dayDetail}T00:00:00`))
            : undefined
        }
        size="lg"
      >
        {dayDetail && (
          <div className="flex flex-col gap-3">
            <ul className="flex flex-col gap-2">
              {dayDetailEntries
                .slice()
                .sort((a, b) => a.starts_at.localeCompare(b.starts_at))
                .map((rdv) => (
                  <li
                    key={rdv.id}
                    className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border bg-surface p-3 text-sm"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-medium">
                        {new Date(rdv.starts_at).toLocaleTimeString("fr-FR", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                      <span>
                        {rdv.patient.prenom} {rdv.patient.nom}
                      </span>
                      <span className="text-muted">· {rdv.praticien.name}</span>
                      <span className="text-muted">· {t(`rendezvous.type.${rdv.type}`)}</span>
                      <Badge tone={STATUT_TONE[rdv.statut]}>{t(`rendezvous.statut.${rdv.statut}`)}</Badge>
                    </div>
                    <div className="flex gap-2">
                      {NEXT_STATUS[rdv.statut] && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleAdvance(rdv)}
                          disabled={busyId === rdv.id}
                        >
                          {t(`rendezvous.statut.${NEXT_STATUS[rdv.statut]!}`)}
                        </Button>
                      )}
                      {!["honore", "annule", "absent"].includes(rdv.statut) && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleCancel(rdv)}
                          disabled={busyId === rdv.id}
                          className="text-danger hover:bg-danger-light"
                        >
                          {t("rendezvous.cancel")}
                        </Button>
                      )}
                    </div>
                  </li>
                ))}
              {dayDetailEntries.length === 0 && (
                <li className="text-sm text-muted">{t("rendezvous.noResults")}</li>
              )}
            </ul>
            <Button
              onClick={() => {
                setFormDate(dayDetail);
                setDayDetail(null);
                setShowForm(true);
              }}
              className="self-start"
            >
              + {t("rendezvous.newRendezVous")}
            </Button>
          </div>
        )}
      </Modal>
    </div>
  );
}
