"use client";

import { useEffect, useState } from "react";
import { UserCheck, UserX, Users, type LucideIcon } from "lucide-react";
import { createEmploye, fetchEmployes } from "./personnel-api";
import type { Employe, EmployeStatut, TypeContrat } from "./types";
import { Badge, Button, Card, Field, Input, Modal, Select, type Tone } from "@/components/ui";
import { useTranslation } from "@/lib/i18n/LanguageContext";

const EMPLOYE_STATUT_TONE: Record<EmployeStatut, Tone> = {
  actif: "success",
  inactif: "neutral",
  suspendu: "danger",
};

function StatCard({
  label,
  value,
  tone,
  icon: Icon,
}: {
  label: string;
  value: number;
  tone: "primary" | "success" | "danger";
  icon: LucideIcon;
}) {
  const chipClass = {
    primary: "bg-primary-light text-primary",
    success: "bg-success-light text-success",
    danger: "bg-danger-light text-danger",
  }[tone];
  const valueClass = {
    primary: "text-primary",
    success: "text-success",
    danger: "text-danger",
  }[tone];
  return (
    <Card className="flex items-start gap-3 p-4">
      <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${chipClass}`}>
        <Icon size={18} />
      </span>
      <div className="min-w-0">
        <div className="text-xs font-medium text-muted">{label}</div>
        <div className={`mt-1 text-2xl font-semibold ${valueClass}`}>{value}</div>
      </div>
    </Card>
  );
}

export function Employes() {
  const { t } = useTranslation();
  const [employes, setEmployes] = useState<Employe[]>([]);
  const [showForm, setShowForm] = useState(false);

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
    fetchEmployes().then((res) => setEmployes(res.data));
  }

  useEffect(() => {
    load();
  }, []);

  const actifsCount = employes.filter((e) => e.statut === "actif").length;
  const inactifsCount = employes.length - actifsCount;

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <StatCard label={t("personnel.employes.statTotal")} value={employes.length} tone="primary" icon={Users} />
        <StatCard label={t("personnel.employes.statActifs")} value={actifsCount} tone="success" icon={UserCheck} />
        <StatCard label={t("personnel.employes.statInactifs")} value={inactifsCount} tone="danger" icon={UserX} />
      </div>

      <div className="flex justify-end">
        <Button onClick={() => setShowForm(true)}>
          + {t("personnel.employes.newEmploye")}
        </Button>
      </div>

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

      <Card className="p-0 overflow-hidden">
        <table className="table">
          <thead>
            <tr>
              <th>{t("personnel.employes.tableMatricule")}</th>
              <th>{t("personnel.employes.tableNom")}</th>
              <th>{t("personnel.employes.tablePrenom")}</th>
              <th>{t("personnel.employes.tableFonction")}</th>
              <th>{t("personnel.employes.tableService")}</th>
              <th>{t("personnel.employes.tableTypeContrat")}</th>
              <th>{t("personnel.employes.tableStatut")}</th>
            </tr>
          </thead>
          <tbody>
            {employes.map((e) => (
              <tr key={e.id}>
                <td>{e.matricule}</td>
                <td>{e.nom}</td>
                <td>{e.prenom}</td>
                <td>{e.fonction}</td>
                <td>{e.service ?? "-"}</td>
                <td>
                  <Badge tone="neutral">{TYPE_CONTRAT_LABELS[e.type_contrat]}</Badge>
                </td>
                <td>
                  <Badge tone={EMPLOYE_STATUT_TONE[e.statut]}>{EMPLOYE_STATUT_LABELS[e.statut]}</Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {employes.length === 0 && (
          <p className="text-sm text-muted p-4">{t("personnel.employes.noEmployes")}</p>
        )}
      </Card>
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
  const [typeContrat, setTypeContrat] = useState<TypeContrat>("cdi");
  const [dateEmbauche, setDateEmbauche] = useState("");
  const [busy, setBusy] = useState(false);

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
      setNom("");
      setPrenom("");
      setFonction("");
      setService("");
      setDateEmbauche("");
      onCreated();
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <div className="grid grid-cols-2 gap-3">
        <Field label={t("personnel.employes.formNom")}>
          <Input
            placeholder={t("personnel.employes.formNom")}
            value={nom}
            onChange={(e) => setNom(e.target.value)}
          />
        </Field>
        <Field label={t("personnel.employes.formPrenom")}>
          <Input
            placeholder={t("personnel.employes.formPrenom")}
            value={prenom}
            onChange={(e) => setPrenom(e.target.value)}
          />
        </Field>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Field label={t("personnel.employes.formFonction")}>
          <Input
            placeholder={t("personnel.employes.formFonction")}
            value={fonction}
            onChange={(e) => setFonction(e.target.value)}
          />
        </Field>
        <Field label={t("personnel.employes.formService")}>
          <Input
            placeholder={t("personnel.employes.formService")}
            value={service}
            onChange={(e) => setService(e.target.value)}
          />
        </Field>
      </div>
      <div className="grid grid-cols-2 gap-3">
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
        <Field label={t("personnel.employes.formDateEmbauche")}>
          <Input
            type="date"
            value={dateEmbauche}
            onChange={(e) => setDateEmbauche(e.target.value)}
          />
        </Field>
      </div>
      <div className="flex gap-2">
        <Button type="submit" disabled={busy}>
          {t("personnel.employes.submit")}
        </Button>
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            {t("common.cancel")}
          </Button>
        )}
      </div>
    </form>
  );
}
