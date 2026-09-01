"use client";

import { useEffect, useMemo, useState } from "react";
import {
  IconPlus,
  IconSearch,
  IconUserCheck,
  IconUsers,
  IconUserX,
} from "@tabler/icons-react";
import { createEmploye, fetchEmployes, fetchServices } from "./personnel-api";
import { EmployeCard } from "./EmployeCard";
import type { Employe, EmployeStatut, TypeContrat } from "./types";
import { EmployeRemunerationForm } from "@/features/comptabilite/EmployeRemunerationForm";
import { useAuth } from "@/features/auth/auth-context";
import {
  Avatar,
  Badge,
  Button,
  DataTable,
  DateInput,
  Field,
  Input,
  Modal,
  Select,
  StatCard,
  ViewToggle,
  useViewMode,
  type Column,
  type Tone,
} from "@/components/ui";
import { useTranslation } from "@/lib/i18n/LanguageContext";

const EMPLOYE_STATUT_TONE: Record<EmployeStatut, Tone> = {
  actif: "success",
  inactif: "neutral",
  suspendu: "danger",
};

export function Employes() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [employes, setEmployes] = useState<Employe[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [remunerationTarget, setRemunerationTarget] = useState<Employe | null>(
    null,
  );
  const [view, setView] = useViewMode("personnel.view");
  const [gridQuery, setGridQuery] = useState("");

  const gridResults = useMemo(() => {
    const q = gridQuery.trim().toLowerCase();
    if (!q) return employes;
    return employes.filter((e) =>
      `${e.prenom} ${e.nom} ${e.matricule} ${e.fonction} ${e.service ?? ""}`
        .toLowerCase()
        .includes(q),
    );
  }, [employes, gridQuery]);

  const canManagePay =
    user?.roles.some((r) =>
      ["comptable", "gestionnaire-rh", "administrateur"].includes(r),
    ) ?? false;

  const TYPE_CONTRAT_LABELS: Record<TypeContrat, string> = {
    cdi: t("personnel.typeContrat.cdi"),
    cdd: t("personnel.typeContrat.cdd"),
    vacataire: t("personnel.typeContrat.vacataire"),
    stage: t("personnel.typeContrat.stage"),
  };

  const EMPLOYE_STATUT_LABELS: Record<EmployeStatut, string> = {
    actif: t("personnel.employeStatut.actif"),
    inactif: t("personnel.employeStatut.inactif"),
    suspendu: t("personnel.employeStatut.suspendu"),
  };

  function load() {
    fetchEmployes()
      .then((res) => setEmployes(res.data))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
  }, []);

  const actifsCount = employes.filter((e) => e.statut === "actif").length;
  const inactifsCount = employes.length - actifsCount;

  const columns: Column<Employe>[] = [
    {
      key: "employe",
      header: t("personnel.employes.tableNom"),
      cell: (e) => (
        <div className="flex items-center gap-2.5">
          <Avatar initials={`${e.prenom.charAt(0)}${e.nom.charAt(0)}`} size="md" />
          <div>
            <span className="font-semibold text-heading">
              {e.prenom} {e.nom}
            </span>
            <span className="block text-[13px] text-muted">{e.matricule}</span>
          </div>
        </div>
      ),
    },
    {
      key: "fonction",
      header: t("personnel.employes.tableFonction"),
      cell: (e) => e.fonction,
    },
    {
      key: "service",
      header: t("personnel.employes.tableService"),
      cell: (e) => e.service ?? "-",
    },
    {
      key: "contrat",
      header: t("personnel.employes.tableTypeContrat"),
      cell: (e) => (
        <Badge tone="neutral">{TYPE_CONTRAT_LABELS[e.type_contrat]}</Badge>
      ),
    },
    {
      key: "statut",
      header: t("personnel.employes.tableStatut"),
      cell: (e) => (
        <Badge tone={EMPLOYE_STATUT_TONE[e.statut]} border>
          {EMPLOYE_STATUT_LABELS[e.statut]}
        </Badge>
      ),
    },
    ...(canManagePay
      ? [
          {
            key: "actions",
            header: "",
            className: "text-right",
            headClassName: "text-right",
            cell: (e: Employe) => (
              <div className="flex justify-end">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setRemunerationTarget(e)}
                >
                  {t("comptabilite.remuneration.bouton")}
                </Button>
              </div>
            ),
          } as Column<Employe>,
        ]
      : []),
  ];

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <StatCard
          label={t("personnel.employes.statTotal")}
          value={employes.length}
          tone="primary"
          icon={<IconUsers size={18} />}
        />
        <StatCard
          label={t("personnel.employes.statActifs")}
          value={actifsCount}
          tone="success"
          icon={<IconUserCheck size={18} />}
        />
        <StatCard
          label={t("personnel.employes.statInactifs")}
          value={inactifsCount}
          tone="danger"
          icon={<IconUserX size={18} />}
        />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <ViewToggle
          mode={view}
          onChange={setView}
          listLabel={t("common.datatable.viewList")}
          gridLabel={t("common.datatable.viewGrid")}
        />
        <Button icon={<IconPlus size={15} />} onClick={() => setShowForm(true)}>
          {t("personnel.employes.newEmploye")}
        </Button>
      </div>

      {view === "list" ? (
        <DataTable
          columns={columns}
          rows={employes}
          getRowKey={(e) => e.id}
          searchAccessor={(e) =>
            `${e.prenom} ${e.nom} ${e.matricule} ${e.fonction} ${e.service ?? ""}`
          }
          loading={loading}
          emptyLabel={t("personnel.employes.noEmployes")}
        />
      ) : (
        <div className="flex flex-col gap-4">
          <div className="relative max-w-sm">
            <IconSearch
              size={15}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted"
            />
            <Input
              type="search"
              value={gridQuery}
              onChange={(e) => setGridQuery(e.target.value)}
              placeholder={t("common.datatable.search")}
              className="pl-9"
            />
          </div>
          {loading ? (
            <p className="text-sm text-muted">{t("common.loading")}</p>
          ) : gridResults.length === 0 ? (
            <p className="text-sm text-muted">
              {t("personnel.employes.noEmployes")}
            </p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {gridResults.map((e) => (
                <EmployeCard
                  key={e.id}
                  employe={e}
                  onRemuneration={
                    canManagePay ? () => setRemunerationTarget(e) : undefined
                  }
                />
              ))}
            </div>
          )}
        </div>
      )}

      <Modal
        open={showForm}
        onClose={() => setShowForm(false)}
        title={t("personnel.employes.newEmploye")}
        size="lg"
      >
        <CreateEmployeForm
          onCancel={() => setShowForm(false)}
          onCreated={() => {
            setShowForm(false);
            load();
          }}
        />
      </Modal>

      <Modal
        open={remunerationTarget !== null}
        onClose={() => setRemunerationTarget(null)}
        title={
          remunerationTarget
            ? `${t("comptabilite.remuneration.titre")} — ${remunerationTarget.prenom} ${remunerationTarget.nom}`
            : ""
        }
        size="md"
      >
        {remunerationTarget && (
          <EmployeRemunerationForm
            employeId={remunerationTarget.id}
            onCancel={() => setRemunerationTarget(null)}
            onSaved={() => setRemunerationTarget(null)}
          />
        )}
      </Modal>
    </div>
  );
}

function CreateEmployeForm({
  onCancel,
  onCreated,
}: {
  onCancel?: () => void;
  onCreated: () => void;
}) {
  const { t } = useTranslation();
  const [nom, setNom] = useState("");
  const [prenom, setPrenom] = useState("");
  const [fonction, setFonction] = useState("");
  const [service, setService] = useState("");
  const [services, setServices] = useState<{ code: string; nom: string }[]>([]);
  const [typeContrat, setTypeContrat] = useState<TypeContrat>("cdi");
  const [dateEmbauche, setDateEmbauche] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    fetchServices()
      .then((res) => setServices(res.data))
      .catch(() => {
        /* champ libre en repli */
      });
  }, []);

  const TYPE_CONTRAT_LABELS: Record<TypeContrat, string> = {
    cdi: t("personnel.typeContrat.cdi"),
    cdd: t("personnel.typeContrat.cdd"),
    vacataire: t("personnel.typeContrat.vacataire"),
    stage: t("personnel.typeContrat.stage"),
  };

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!nom || !prenom || !fonction || !dateEmbauche) return;
    setBusy(true);
    try {
      await createEmploye({
        nom,
        prenom,
        fonction,
        service: service || undefined,
        type_contrat: typeContrat,
        date_embauche: dateEmbauche,
      });
      onCreated();
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label={t("personnel.employes.formNom")} required>
          <Input value={nom} onChange={(e) => setNom(e.target.value)} required />
        </Field>
        <Field label={t("personnel.employes.formPrenom")} required>
          <Input
            value={prenom}
            onChange={(e) => setPrenom(e.target.value)}
            required
          />
        </Field>
        <Field label={t("personnel.employes.formFonction")} required>
          <Input
            value={fonction}
            onChange={(e) => setFonction(e.target.value)}
            required
          />
        </Field>
        <Field label={t("personnel.employes.formService")}>
          {services.length > 0 ? (
            <Select
              value={service}
              onChange={(e) => setService(e.target.value)}
            >
              <option value="">—</option>
              {services.map((s) => (
                <option key={s.code} value={s.nom}>
                  {s.nom}
                </option>
              ))}
            </Select>
          ) : (
            <Input
              value={service}
              onChange={(e) => setService(e.target.value)}
            />
          )}
        </Field>
        <Field label={t("personnel.employes.formTypeContrat")}>
          <Select
            value={typeContrat}
            onChange={(e) => setTypeContrat(e.target.value as TypeContrat)}
          >
            {Object.entries(TYPE_CONTRAT_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
        </Field>
        <Field label={t("personnel.employes.formDateEmbauche")} required>
          <DateInput
            value={dateEmbauche}
            onChange={(e) => setDateEmbauche(e.target.value)}
          />
        </Field>
      </div>
      <div className="flex justify-end gap-2">
        {onCancel && (
          <Button type="button" variant="light" onClick={onCancel}>
            {t("common.cancel")}
          </Button>
        )}
        <Button type="submit" disabled={busy}>
          {t("personnel.employes.submit")}
        </Button>
      </div>
    </form>
  );
}
