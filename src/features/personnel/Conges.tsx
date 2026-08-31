"use client";

import { useCallback, useEffect, useState } from "react";
import { IconPlus } from "@tabler/icons-react";
import {
  demanderConge,
  fetchConges,
  fetchEmployes,
  traiterConge,
} from "./personnel-api";
import type { Conge, CongeStatut, CongeType, Employe } from "./types";
import {
  Badge,
  Button,
  DataTable,
  DateInput,
  Field,
  Modal,
  Select,
  type Column,
  type Tone,
} from "@/components/ui";
import { useTranslation } from "@/lib/i18n/LanguageContext";

const CONGE_STATUT_TONE: Record<CongeStatut, Tone> = {
  en_attente: "warning",
  approuve: "success",
  refuse: "danger",
};

export function Conges() {
  const { t } = useTranslation();
  const [statut, setStatut] = useState<CongeStatut | "">("en_attente");
  const [conges, setConges] = useState<Conge[]>([]);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

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

  const load = useCallback(() => {
    fetchConges(statut, page)
      .then((res) => {
        setConges(res.data);
        setTotal(res.meta.total);
      })
      .finally(() => setLoading(false));
  }, [statut, page]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleTraiter(id: number, decision: "approuve" | "refuse") {
    setBusyId(id);
    try {
      await traiterConge(id, decision);
      load();
    } finally {
      setBusyId(null);
    }
  }

  const columns: Column<Conge>[] = [
    {
      key: "employe",
      header: t("personnel.conges.tableEmploye"),
      cell: (c) =>
        c.employe ? `${c.employe.prenom} ${c.employe.nom}` : "-",
    },
    {
      key: "type",
      header: t("personnel.conges.tableType"),
      cell: (c) => CONGE_TYPE_LABELS[c.type],
    },
    {
      key: "periode",
      header: t("personnel.conges.tablePeriode"),
      cell: (c) =>
        t("personnel.conges.periodeValue", {
          debut: c.date_debut,
          fin: c.date_fin,
        }),
    },
    {
      key: "duree",
      header: t("personnel.conges.tableDuree"),
      cell: (c) => t("personnel.conges.dureeJours", { jours: c.duree_jours }),
    },
    {
      key: "statut",
      header: t("personnel.conges.tableStatut"),
      cell: (c) => (
        <Badge tone={CONGE_STATUT_TONE[c.statut]} border>
          {CONGE_STATUT_LABELS[c.statut]}
        </Badge>
      ),
    },
    {
      key: "actions",
      header: "",
      className: "text-right",
      headClassName: "text-right",
      cell: (c) =>
        c.statut === "en_attente" ? (
          <div className="flex justify-end gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleTraiter(c.id, "approuve")}
              disabled={busyId === c.id}
              className="border-success/40 text-success hover:bg-success-light"
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
        ) : null,
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      <DataTable
        columns={columns}
        rows={conges}
        getRowKey={(c) => c.id}
        page={page}
        perPage={15}
        total={total}
        onPageChange={setPage}
        loading={loading}
        emptyLabel={t("personnel.conges.noConges")}
        toolbarRight={
          <>
            <Select
              value={statut}
              onChange={(e) => {
                setStatut(e.target.value as CongeStatut | "");
                setPage(1);
              }}
              className="w-48"
            >
              <option value="">{t("personnel.conges.tousStatuts")}</option>
              {Object.entries(CONGE_STATUT_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </Select>
            <Button
              icon={<IconPlus size={15} />}
              onClick={() => setShowForm(true)}
            >
              {t("personnel.conges.newDemande")}
            </Button>
          </>
        }
      />

      <Modal
        open={showForm}
        onClose={() => setShowForm(false)}
        title={t("personnel.conges.newDemande")}
        size="lg"
      >
        <CreateCongeForm
          onCancel={() => setShowForm(false)}
          onCreated={() => {
            setShowForm(false);
            load();
          }}
        />
      </Modal>
    </div>
  );
}

function CreateCongeForm({
  onCancel,
  onCreated,
}: {
  onCancel?: () => void;
  onCreated: () => void;
}) {
  const { t } = useTranslation();
  const [employes, setEmployes] = useState<Employe[]>([]);
  const [employeId, setEmployeId] = useState("");
  const [type, setType] = useState<CongeType>("annuel");
  const [dateDebut, setDateDebut] = useState("");
  const [dateFin, setDateFin] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const CONGE_TYPE_LABELS: Record<CongeType, string> = {
    annuel: t("personnel.congeType.annuel"),
    maladie: t("personnel.congeType.maladie"),
    maternite: t("personnel.congeType.maternite"),
    sans_solde: t("personnel.congeType.sans_solde"),
    autre: t("personnel.congeType.autre"),
  };

  useEffect(() => {
    fetchEmployes().then((res) => setEmployes(res.data));
  }, []);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!employeId || !dateDebut || !dateFin) return;
    setError(null);
    setBusy(true);
    try {
      await demanderConge(Number(employeId), {
        type,
        date_debut: dateDebut,
        date_fin: dateFin,
      });
      onCreated();
    } catch {
      setError(t("personnel.conges.error"));
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label={t("personnel.conges.employeLabel")} required>
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
          <Select
            value={type}
            onChange={(e) => setType(e.target.value as CongeType)}
          >
            {Object.entries(CONGE_TYPE_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
        </Field>
        <Field label={t("personnel.conges.dateDebut")} required>
          <DateInput
            value={dateDebut}
            onChange={(e) => setDateDebut(e.target.value)}
          />
        </Field>
        <Field label={t("personnel.conges.dateFin")} required>
          <DateInput value={dateFin} onChange={(e) => setDateFin(e.target.value)} />
        </Field>
      </div>
      {error && (
        <p className="rounded-[5px] bg-danger-light px-3 py-2 text-sm text-danger">
          {error}
        </p>
      )}
      <div className="flex justify-end gap-2">
        {onCancel && (
          <Button type="button" variant="light" onClick={onCancel}>
            {t("common.cancel")}
          </Button>
        )}
        <Button type="submit" disabled={busy}>
          {t("personnel.conges.submit")}
        </Button>
      </div>
    </form>
  );
}
