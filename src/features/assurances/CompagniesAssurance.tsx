"use client";

import { useEffect, useState } from "react";
import { IconBuildingBank, IconCircleCheck, IconPlus } from "@tabler/icons-react";
import { createCompagnie, fetchCompagnies } from "./assurances-api";
import type { CompagnieAssurance } from "./types";
import {
  Badge,
  Button,
  DataTable,
  Field,
  Input,
  Modal,
  StatCard,
  type Column,
} from "@/components/ui";
import { useTranslation } from "@/lib/i18n/LanguageContext";

export function CompagniesAssurance() {
  const { t } = useTranslation();
  const [compagnies, setCompagnies] = useState<CompagnieAssurance[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  function load() {
    fetchCompagnies()
      .then((res) => setCompagnies(res.data))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
  }, []);

  const actives = compagnies.filter((c) => c.actif).length;

  const columns: Column<CompagnieAssurance>[] = [
    {
      key: "nom",
      header: t("assurances.compagnies.nom"),
      cell: (c) => <span className="font-semibold text-heading">{c.nom}</span>,
    },
    {
      key: "tel",
      header: t("assurances.compagnies.telephone"),
      cell: (c) => c.contact_telephone ?? "-",
    },
    {
      key: "taux",
      header: t("assurances.compagnies.tauxCouverture"),
      cell: (c) => `${c.taux_couverture_defaut}%`,
    },
    {
      key: "statut",
      header: t("common.status"),
      cell: (c) => (
        <Badge tone={c.actif ? "success" : "neutral"} border>
          {c.actif ? t("common.active") : t("common.inactive")}
        </Badge>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-4">
        <StatCard
          icon={<IconBuildingBank size={18} />}
          label={t("assurances.compagnies.statTotal")}
          value={compagnies.length}
          tone="primary"
        />
        <StatCard
          icon={<IconCircleCheck size={18} />}
          label={t("assurances.compagnies.statActives")}
          value={actives}
          tone="success"
        />
      </div>

      <DataTable
        columns={columns}
        rows={compagnies}
        getRowKey={(c) => c.id}
        searchAccessor={(c) => `${c.nom} ${c.contact_telephone ?? ""}`}
        loading={loading}
        emptyLabel={t("assurances.compagnies.empty")}
        toolbarRight={
          <Button icon={<IconPlus size={15} />} onClick={() => setShowForm(true)}>
            {t("assurances.compagnies.newCompagnie")}
          </Button>
        }
      />

      <Modal
        open={showForm}
        onClose={() => setShowForm(false)}
        title={t("assurances.compagnies.newCompagnie")}
      >
        <CreateCompagnieForm
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

function CreateCompagnieForm({
  onCancel,
  onCreated,
}: {
  onCancel?: () => void;
  onCreated: () => void;
}) {
  const { t } = useTranslation();
  const [nom, setNom] = useState("");
  const [taux, setTaux] = useState("");
  const [contactTelephone, setContactTelephone] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!nom || !taux) return;
    setBusy(true);
    try {
      await createCompagnie({
        nom,
        taux_couverture_defaut: Number(taux),
        contact_telephone: contactTelephone || undefined,
      });
      onCreated();
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label={t("assurances.compagnies.nom")} required>
          <Input
            placeholder={t("assurances.compagnies.nomPlaceholder")}
            value={nom}
            onChange={(e) => setNom(e.target.value)}
            required
          />
        </Field>
        <Field label={t("assurances.compagnies.tauxCouverture")} required>
          <Input
            placeholder={t("assurances.compagnies.tauxCouverturePlaceholder")}
            value={taux}
            onChange={(e) => setTaux(e.target.value)}
            required
          />
        </Field>
      </div>
      <Field label={t("assurances.compagnies.telephone")}>
        <Input
          placeholder={t("assurances.compagnies.telephonePlaceholder")}
          value={contactTelephone}
          onChange={(e) => setContactTelephone(e.target.value)}
        />
      </Field>
      <div className="flex justify-end gap-2">
        {onCancel && (
          <Button type="button" variant="light" onClick={onCancel}>
            {t("common.cancel")}
          </Button>
        )}
        <Button type="submit" disabled={busy}>
          {t("assurances.compagnies.submit")}
        </Button>
      </div>
    </form>
  );
}
