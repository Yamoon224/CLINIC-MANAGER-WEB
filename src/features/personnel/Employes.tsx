"use client";

import { useEffect, useState } from "react";
import { createEmploye, fetchEmployes } from "./personnel-api";
import type { Employe, TypeContrat } from "./types";
import { Badge, Button, Card, Field, Input, Modal, Select } from "@/components/ui";
import { useTranslation } from "@/lib/i18n/LanguageContext";

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

  function load() {
    fetchEmployes().then((res) => setEmployes(res.data));
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="flex flex-col gap-4">
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
