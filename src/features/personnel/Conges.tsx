"use client";

import { useEffect, useState } from "react";
import { demanderConge, fetchConges, fetchEmployes, traiterConge } from "./personnel-api";
import type { Conge, CongeStatut, CongeType, Employe } from "./types";
import { Badge, Button, Card, Field, Input, Pagination, Select } from "@/components/ui";
import { useTranslation } from "@/lib/i18n/LanguageContext";

const CONGE_STATUT_TONE: Record<CongeStatut, "warning" | "success" | "danger"> = {
  en_attente: "warning",
  approuve: "success",
  refuse: "danger",
};

export function Conges() {
  const { t } = useTranslation();
  const [statut, setStatut] = useState<CongeStatut | "">("en_attente");
  const [conges, setConges] = useState<Conge[]>([]);
  const [employes, setEmployes] = useState<Employe[]>([]);
  const [employeId, setEmployeId] = useState("");
  const [type, setType] = useState<CongeType>("annuel");
  const [dateDebut, setDateDebut] = useState("");
  const [dateFin, setDateFin] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const CONGE_TYPE_LABELS: Record<CongeType, string> = {
    annuel: t("personnel.congeType.annuel"),
    maladie: t("personnel.congeType.maladie"),
    maternite: t("personnel.congeType.maternite"),
    sans_solde: t("personnel.congeType.sans_solde"),
    autre: t("personnel.congeType.autre"),
  };

  const CONGE_STATUT_LABELS: Record<CongeStatut, string> = {
    en_attente: t("personnel.congeStatut.en_attente"),
    approuve: t("personnel.congeStatut.approuve"),
    refuse: t("personnel.congeStatut.refuse"),
  };

  function load() {
    fetchConges(statut, page).then((res) => {
      setConges(res.data);
      setTotalPages(res.meta.last_page);
    });
  }

  useEffect(() => {
    setPage(1);
  }, [statut]);

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statut, page]);

  useEffect(() => {
    fetchEmployes().then((res) => setEmployes(res.data));
  }, []);

  async function handleDemander() {
    if (!employeId || !dateDebut || !dateFin) return;
    setError(null);
    try {
      await demanderConge(Number(employeId), { type, date_debut: dateDebut, date_fin: dateFin });
      setDateDebut("");
      setDateFin("");
      load();
    } catch {
      setError(t("personnel.conges.error"));
    }
  }

  async function handleTraiter(id: number, decision: "approuve" | "refuse") {
    setBusyId(id);
    try {
      await traiterConge(id, decision);
      load();
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <Card className="flex flex-col gap-3">
        <div className="grid grid-cols-2 gap-3">
          <Field label={t("personnel.conges.employeLabel")}>
            <Select value={employeId} onChange={(e) => setEmployeId(e.target.value)}>
              <option value="">{t("personnel.conges.employePlaceholder")}</option>
              {employes.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.prenom} {e.nom}
                </option>
              ))}
            </Select>
          </Field>
          <Field label={t("personnel.conges.typeLabel")}>
            <Select value={type} onChange={(e) => setType(e.target.value as CongeType)}>
              {Object.entries(CONGE_TYPE_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </Select>
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label={t("personnel.conges.dateDebut")}>
            <Input
              type="date"
              value={dateDebut}
              onChange={(e) => setDateDebut(e.target.value)}
            />
          </Field>
          <Field label={t("personnel.conges.dateFin")}>
            <Input type="date" value={dateFin} onChange={(e) => setDateFin(e.target.value)} />
          </Field>
        </div>
        {error && (
          <p className="rounded-lg bg-danger-light px-3 py-2 text-sm text-danger">{error}</p>
        )}
        <Button onClick={handleDemander} className="self-start">
          {t("personnel.conges.submit")}
        </Button>
      </Card>

      <Field label={t("personnel.conges.filtreStatut")}>
        <Select
          value={statut}
          onChange={(e) => setStatut(e.target.value as CongeStatut | "")}
          className="w-56"
        >
          <option value="">{t("personnel.conges.tousStatuts")}</option>
          {Object.entries(CONGE_STATUT_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </Select>
      </Field>

      <Card className="p-0 overflow-hidden">
        <table className="table">
          <thead>
            <tr>
              <th>{t("personnel.conges.tableEmploye")}</th>
              <th>{t("personnel.conges.tableType")}</th>
              <th>{t("personnel.conges.tablePeriode")}</th>
              <th>{t("personnel.conges.tableDuree")}</th>
              <th>{t("personnel.conges.tableStatut")}</th>
              <th>{t("personnel.conges.tableActions")}</th>
            </tr>
          </thead>
          <tbody>
            {conges.map((c) => (
              <tr key={c.id}>
                <td>{c.employe && `${c.employe.prenom} ${c.employe.nom}`}</td>
                <td>{CONGE_TYPE_LABELS[c.type]}</td>
                <td>
                  {t("personnel.conges.periodeValue", { debut: c.date_debut, fin: c.date_fin })}
                </td>
                <td>{t("personnel.conges.dureeJours", { jours: c.duree_jours })}</td>
                <td>
                  <Badge tone={CONGE_STATUT_TONE[c.statut]}>{CONGE_STATUT_LABELS[c.statut]}</Badge>
                </td>
                <td>
                  {c.statut === "en_attente" && (
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleTraiter(c.id, "approuve")}
                        disabled={busyId === c.id}
                        className="border-success/30 text-success hover:bg-success-light"
                      >
                        {t("personnel.conges.approuver")}
                      </Button>
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => handleTraiter(c.id, "refuse")}
                        disabled={busyId === c.id}
                      >
                        {t("personnel.conges.refuser")}
                      </Button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {conges.length === 0 && (
          <p className="text-sm text-muted p-4">{t("personnel.conges.noConges")}</p>
        )}
      </Card>
      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
    </div>
  );
}
