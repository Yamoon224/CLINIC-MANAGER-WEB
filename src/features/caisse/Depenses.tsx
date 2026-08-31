"use client";

import { useCallback, useEffect, useState } from "react";
import { IconPlus, IconReceipt, IconWallet } from "@tabler/icons-react";
import { createDepense, fetchDepenses } from "./caisse-api";
import type { Depense } from "./types";
import {
  Button,
  CsvButton,
  DataTable,
  Field,
  Input,
  Modal,
  StatCard,
  Textarea,
  type Column,
} from "@/components/ui";
import { useTranslation } from "@/lib/i18n/LanguageContext";

export function Depenses() {
  const { t } = useTranslation();
  const [depenses, setDepenses] = useState<Depense[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const load = useCallback(() => {
    fetchDepenses(page)
      .then((res) => {
        setDepenses(res.data);
        setTotal(res.meta.total);
      })
      .finally(() => setLoading(false));
  }, [page]);

  useEffect(() => {
    load();
  }, [load]);

  const montantPage = depenses.reduce((sum, d) => sum + Number(d.montant), 0);

  const columns: Column<Depense>[] = [
    {
      key: "categorie",
      header: t("caisse.depenses.categorie"),
      cell: (d) => d.categorie,
    },
    {
      key: "description",
      header: t("caisse.depenses.description"),
      cell: (d) => d.description ?? "-",
    },
    {
      key: "montant",
      header: t("caisse.depenses.montant"),
      className: "font-semibold text-heading",
      cell: (d) => `${Number(d.montant).toLocaleString("fr-FR")} F CFA`,
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-4">
        <StatCard
          icon={<IconReceipt size={18} />}
          label={t("caisse.depenses.statTotal")}
          value={total}
          tone="primary"
        />
        <StatCard
          icon={<IconWallet size={18} />}
          label={t("caisse.depenses.statMontantPage")}
          value={`${montantPage.toLocaleString("fr-FR")} F CFA`}
          tone="info"
        />
      </div>

      <DataTable
        columns={columns}
        rows={depenses}
        getRowKey={(d) => d.id}
        page={page}
        perPage={15}
        total={total}
        onPageChange={setPage}
        loading={loading}
        emptyLabel={t("caisse.depenses.empty")}
        toolbarRight={
          <>
            <CsvButton
              path="/depenses/export.csv"
              label={t("caisse.export.csv")}
              filename="depenses.csv"
            />
            <Button
              icon={<IconPlus size={15} />}
              onClick={() => setShowForm(true)}
            >
              {t("caisse.depenses.nouvelle")}
            </Button>
          </>
        }
      />

      <Modal
        open={showForm}
        onClose={() => setShowForm(false)}
        title={t("caisse.depenses.nouvelle")}
      >
        <DepenseForm
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

function DepenseForm({
  onCancel,
  onCreated,
}: {
  onCancel?: () => void;
  onCreated: () => void;
}) {
  const { t } = useTranslation();
  const [categorie, setCategorie] = useState("");
  const [montant, setMontant] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!categorie || !montant) return;
    setIsSubmitting(true);
    try {
      await createDepense({
        categorie,
        montant: Number(montant),
        description: description || undefined,
      });
      onCreated();
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label={t("caisse.depenses.categorie")} required>
          <Input
            placeholder={t("caisse.depenses.categoriePlaceholder")}
            value={categorie}
            onChange={(e) => setCategorie(e.target.value)}
            required
          />
        </Field>
        <Field label={t("caisse.depenses.montant")} required>
          <Input
            placeholder={t("caisse.depenses.montantPlaceholder")}
            value={montant}
            onChange={(e) => setMontant(e.target.value)}
            required
          />
        </Field>
      </div>
      <Field label={t("caisse.depenses.description")}>
        <Textarea
          placeholder={t("caisse.depenses.descriptionPlaceholder")}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={2}
        />
      </Field>
      <div className="flex justify-end gap-2">
        {onCancel && (
          <Button type="button" variant="light" onClick={onCancel}>
            {t("common.cancel")}
          </Button>
        )}
        <Button type="submit" disabled={isSubmitting}>
          {t("caisse.depenses.submit")}
        </Button>
      </div>
    </form>
  );
}
