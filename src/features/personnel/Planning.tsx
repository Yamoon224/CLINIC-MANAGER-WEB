"use client";

import { useEffect, useMemo, useState } from "react";
import { IconChevronLeft, IconChevronRight } from "@tabler/icons-react";
import { assignerPlanning, fetchEmployes, fetchPlanning, retirerPlanning } from "./personnel-api";
import { type Creneau, type Employe, type Planning as PlanningEntry } from "./types";
import { Badge, Button, Card, DateInput, Field, Input, Modal, Select, TONE_CLASSES, type Tone } from "@/components/ui";
import { useTranslation } from "@/lib/i18n/LanguageContext";
import { addMonths, buildMonthGrid, startOfMonth, toISODate } from "@/lib/calendar";

const CRENEAU_TONE: Record<Creneau, Tone> = {
  matin: "primary",
  apres_midi: "accent",
  nuit: "neutral",
  garde: "warning",
};

export function Planning() {
  const { t, locale } = useTranslation();
  const [monthCursor, setMonthCursor] = useState(() => startOfMonth(new Date()));
  const [entries, setEntries] = useState<PlanningEntry[]>([]);
  const [busy, setBusy] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [formDate, setFormDate] = useState<string | undefined>(undefined);
  const [dayDetail, setDayDetail] = useState<string | null>(null);

  const CRENEAU_LABELS: Record<Creneau, string> = {
    matin: t("personnel.creneau.matin"),
    apres_midi: t("personnel.creneau.apres_midi"),
    nuit: t("personnel.creneau.nuit"),
    garde: t("personnel.creneau.garde"),
  };

  const days = useMemo(() => buildMonthGrid(monthCursor), [monthCursor]);
  const gridStart = days[0];
  const gridEnd = days[days.length - 1];

  function load() {
    fetchPlanning(toISODate(gridStart), toISODate(gridEnd), 1, 200).then((res) => {
      setEntries(res.data);
    });
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [monthCursor]);

  async function handleRetirer(id: number) {
    setBusy(true);
    try {
      await retirerPlanning(id);
      load();
    } finally {
      setBusy(false);
    }
  }

  const entriesByDay = useMemo(() => {
    const map = new Map<string, PlanningEntry[]>();
    for (const entry of entries) {
      const list = map.get(entry.date) ?? [];
      list.push(entry);
      map.set(entry.date, list);
    }
    return map;
  }, [entries]);

  const monthLabel = new Intl.DateTimeFormat(locale, { month: "long", year: "numeric" }).format(monthCursor);
  const weekdayLabels = useMemo(() => {
    const formatter = new Intl.DateTimeFormat(locale, { weekday: "short" });
    return days.slice(0, 7).map((day) => formatter.format(day));
  }, [days, locale]);
  const dayDetailEntries = dayDetail ? entriesByDay.get(dayDetail) ?? [] : [];
  const today = toISODate(new Date());

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setMonthCursor((m) => addMonths(m, -1))}>
            <IconChevronLeft size={16} />
          </Button>
          <span className="min-w-[10rem] text-center text-sm font-semibold capitalize">{monthLabel}</span>
          <Button variant="outline" size="sm" onClick={() => setMonthCursor((m) => addMonths(m, 1))}>
            <IconChevronRight size={16} />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setMonthCursor(startOfMonth(new Date()))}>
            {t("personnel.planning.today")}
          </Button>
        </div>
        <Button
          onClick={() => {
            setFormDate(undefined);
            setShowForm(true);
          }}
        >
          + {t("personnel.planning.newCreneau")}
        </Button>
      </div>

      <div className="flex flex-wrap gap-2">
        {(Object.keys(CRENEAU_LABELS) as Creneau[]).map((key) => (
          <Badge key={key} tone={CRENEAU_TONE[key]}>
            {CRENEAU_LABELS[key]}
          </Badge>
        ))}
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
            const dayEntries = entriesByDay.get(key) ?? [];
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
                  {dayEntries.slice(0, 3).map((entry) => (
                    <span
                      key={entry.id}
                      className={`truncate rounded px-1 py-0.5 text-[10px] font-medium ${TONE_CLASSES[CRENEAU_TONE[entry.creneau]]}`}
                    >
                      {entry.employe ? `${entry.employe.prenom} ${entry.employe.nom}` : CRENEAU_LABELS[entry.creneau]}
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
        title={t("personnel.planning.newCreneau")}
        size="lg"
      >
        <CreateCreneauForm
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
        size="md"
      >
        {dayDetail && (
          <div className="flex flex-col gap-3">
            <ul className="flex flex-col gap-2">
              {dayDetailEntries.map((entry) => (
                <li
                  key={entry.id}
                  className="flex items-center justify-between gap-2 rounded-[6px] border border-border bg-surface p-3 text-sm"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge tone={CRENEAU_TONE[entry.creneau]}>{CRENEAU_LABELS[entry.creneau]}</Badge>
                    <span>{entry.employe && `${entry.employe.prenom} ${entry.employe.nom}`}</span>
                    {entry.service && <span className="text-muted">· {entry.service}</span>}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleRetirer(entry.id)}
                    disabled={busy}
                    className="text-danger hover:bg-danger-light"
                  >
                    {t("personnel.planning.retirer")}
                  </Button>
                </li>
              ))}
              {dayDetailEntries.length === 0 && (
                <li className="text-sm text-muted">{t("personnel.planning.noEntries")}</li>
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
              + {t("personnel.planning.newCreneau")}
            </Button>
          </div>
        )}
      </Modal>
    </div>
  );
}

function CreateCreneauForm({
  initialDate,
  onCancel,
  onCreated,
}: {
  initialDate?: string;
  onCancel?: () => void;
  onCreated: () => void;
}) {
  const { t } = useTranslation();
  const [employes, setEmployes] = useState<Employe[]>([]);
  const [employeId, setEmployeId] = useState("");
  const [date, setDate] = useState(initialDate ?? "");
  const [creneau, setCreneau] = useState<Creneau>("matin");
  const [service, setService] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const CRENEAU_LABELS: Record<Creneau, string> = {
    matin: t("personnel.creneau.matin"),
    apres_midi: t("personnel.creneau.apres_midi"),
    nuit: t("personnel.creneau.nuit"),
    garde: t("personnel.creneau.garde"),
  };

  useEffect(() => {
    fetchEmployes().then((res) => setEmployes(res.data));
  }, []);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!employeId || !date) return;
    setBusy(true);
    setError(null);
    try {
      await assignerPlanning(Number(employeId), { date, creneau, service: service || undefined });
      onCreated();
    } catch {
      setError(t("personnel.planning.error"));
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <div className="grid grid-cols-2 gap-3">
        <Field label={t("personnel.planning.employeLabel")}>
          <Select value={employeId} onChange={(e) => setEmployeId(e.target.value)}>
            <option value="">{t("personnel.planning.employePlaceholder")}</option>
            {employes.map((e) => (
              <option key={e.id} value={e.id}>
                {e.prenom} {e.nom}
              </option>
            ))}
          </Select>
        </Field>
        <Field label={t("personnel.planning.creneauLabel")}>
          <Select value={creneau} onChange={(e) => setCreneau(e.target.value as Creneau)}>
            {Object.entries(CRENEAU_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
        </Field>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Field label={t("personnel.planning.dateLabel")}>
          <DateInput value={date} onChange={(e) => setDate(e.target.value)} />
        </Field>
        <Field label={t("personnel.planning.serviceLabel")}>
          <Input
            placeholder={t("personnel.planning.serviceLabel")}
            value={service}
            onChange={(e) => setService(e.target.value)}
          />
        </Field>
      </div>
      {error && (
        <p className="rounded-[5px] bg-danger-light px-3 py-2 text-sm text-danger">{error}</p>
      )}
      <div className="flex flex-row-reverse justify-start gap-2">
        <Button type="submit" disabled={busy}>
          {t("personnel.planning.submit")}
        </Button>
        {onCancel && (
          <Button type="button" variant="light" onClick={onCancel}>
            {t("common.cancel")}
          </Button>
        )}
      </div>
    </form>
  );
}
