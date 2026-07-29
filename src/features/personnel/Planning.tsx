"use client";

import { useEffect, useState } from "react";
import { assignerPlanning, fetchEmployes, fetchPlanning, retirerPlanning } from "./personnel-api";
import { type Creneau, type Employe, type Planning as PlanningEntry } from "./types";
import { Badge, Button, Card, Field, Input, Pagination, Select } from "@/components/ui";
import { useTranslation } from "@/lib/i18n/LanguageContext";

export function Planning() {
  const { t } = useTranslation();
  const [entries, setEntries] = useState<PlanningEntry[]>([]);
  const [employes, setEmployes] = useState<Employe[]>([]);
  const [employeId, setEmployeId] = useState("");
  const [date, setDate] = useState("");
  const [creneau, setCreneau] = useState<Creneau>("matin");
  const [service, setService] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const CRENEAU_LABELS: Record<Creneau, string> = {
    matin: t("personnel.creneau.matin"),
    apres_midi: t("personnel.creneau.apres_midi"),
    nuit: t("personnel.creneau.nuit"),
    garde: t("personnel.creneau.garde"),
  };

  function load() {
    fetchPlanning(undefined, undefined, page).then((res) => {
      setEntries(res.data);
      setTotalPages(res.meta.last_page);
    });
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  useEffect(() => {
    fetchEmployes().then((res) => setEmployes(res.data));
  }, []);

  async function handleAssigner() {
    if (!employeId || !date) return;
    setBusy(true);
    setError(null);
    try {
      await assignerPlanning(Number(employeId), { date, creneau, service: service || undefined });
      setDate("");
      setService("");
      load();
    } catch {
      setError(t("personnel.planning.error"));
    } finally {
      setBusy(false);
    }
  }

  async function handleRetirer(id: number) {
    setBusy(true);
    try {
      await retirerPlanning(id);
      load();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <Card className="flex flex-col gap-3">
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
            <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
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
          <p className="rounded-lg bg-danger-light px-3 py-2 text-sm text-danger">{error}</p>
        )}
        <Button onClick={handleAssigner} disabled={busy} className="self-start">
          {t("personnel.planning.submit")}
        </Button>
      </Card>

      <Card className="p-0 overflow-hidden">
        <table className="table">
          <thead>
            <tr>
              <th>{t("personnel.planning.tableDate")}</th>
              <th>{t("personnel.planning.tableCreneau")}</th>
              <th>{t("personnel.planning.tableEmploye")}</th>
              <th>{t("personnel.planning.tableService")}</th>
              <th>{t("personnel.planning.tableActions")}</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((p) => (
              <tr key={p.id}>
                <td>{p.date}</td>
                <td>
                  <Badge tone="primary">{CRENEAU_LABELS[p.creneau]}</Badge>
                </td>
                <td>{p.employe && `${p.employe.prenom} ${p.employe.nom}`}</td>
                <td>{p.service ?? "-"}</td>
                <td>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRetirer(p.id)}
                    disabled={busy}
                    className="text-danger hover:bg-danger-light"
                  >
                    {t("personnel.planning.retirer")}
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {entries.length === 0 && (
          <p className="text-sm text-muted p-4">{t("personnel.planning.noEntries")}</p>
        )}
      </Card>
      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
    </div>
  );
}
