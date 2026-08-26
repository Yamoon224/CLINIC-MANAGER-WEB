"use client";

import { useEffect, useState } from "react";
import { Receipt, Wallet, type LucideIcon } from "lucide-react";
import { createDepense, fetchDepenses } from "./caisse-api";
import type { Depense } from "./types";
import { Button, Card, CsvButton, Field, Input, Modal, Pagination } from "@/components/ui";
import { useTranslation } from "@/lib/i18n/LanguageContext";

function StatCard({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon;
  label: string;
  value: string | number;
}) {
  return (
    <Card className="flex items-center gap-3 p-4">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-light text-primary">
        <Icon size={18} />
      </span>
      <div className="min-w-0">
        <div className="text-xs font-medium text-muted">{label}</div>
        <div className="mt-1 text-2xl font-semibold text-foreground">{value}</div>
      </div>
    </Card>
  );
}

export function Depenses() {
  const { t } = useTranslation();
  const [depenses, setDepenses] = useState<Depense[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalDepenses, setTotalDepenses] = useState(0);
  const [showForm, setShowForm] = useState(false);
  const [dateDebut, setDateDebut] = useState("");
  const [dateFin, setDateFin] = useState("");

  function load() {
    fetchDepenses(page).then((res) => {
      setDepenses(res.data);
      setTotalPages(res.meta.last_page);
      setTotalDepenses(res.meta.total);
    });
  }

  useEffect(() => {
    load();
  }, [page]);

  const montantPage = depenses.reduce((sum, d) => sum + Number(d.montant), 0);

  const exportParams = new URLSearchParams();
  if (dateDebut) exportParams.set("from", dateDebut);
  if (dateFin) exportParams.set("to", dateFin);

  return (
    <div className="flex flex-col gap-4">
      {depenses.length > 0 && (
        <div className="grid grid-cols-2 gap-4">
          <StatCard
            icon={Receipt}
            label={t("caisse.depenses.statTotal")}
            value={totalDepenses}
          />
          <StatCard
            icon={Wallet}
            label={t("caisse.depenses.statMontantPage")}
            value={`${montantPage.toLocaleString("fr-FR")} F CFA`}
          />
        </div>
      )}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="flex items-end gap-2">
          <Field label={t("caisse.export.from")}>
            <Input type="date" value={dateDebut} onChange={(e) => setDateDebut(e.target.value)} />
          </Field>
          <Field label={t("caisse.export.to")}>
            <Input type="date" value={dateFin} onChange={(e) => setDateFin(e.target.value)} />
          </Field>
          <CsvButton
            path={`/depenses/export.csv?${exportParams}`}
            label={t("caisse.export.csv")}
            filename="depenses.csv"
          />
        </div>
        <Button onClick={() => setShowForm(true)}>
          + {t("caisse.depenses.nouvelle")}
        </Button>
      </div>

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

      <Card className="p-0 overflow-hidden">
        <table className="table">
          <thead>
            <tr>
              <th>{t("caisse.depenses.categorie")}</th>
              <th>{t("caisse.depenses.description")}</th>
              <th>{t("caisse.depenses.montant")}</th>
            </tr>
          </thead>
          <tbody>
            {depenses.map((d) => (
              <tr key={d.id}>
                <td>{d.categorie}</td>
                <td>{d.description ?? "-"}</td>
                <td>{d.montant} F CFA</td>
              </tr>
            ))}
          </tbody>
        </table>
        {depenses.length === 0 && (
          <p className="text-sm text-muted p-4">{t("caisse.depenses.empty")}</p>
        )}
      </Card>
      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
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
      setCategorie("");
      setMontant("");
      setDescription("");
      onCreated();
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <div className="flex gap-2">
        <div className="flex-1">
          <Field label={t("caisse.depenses.categorie")}>
            <Input
              placeholder={t("caisse.depenses.categoriePlaceholder")}
              value={categorie}
              onChange={(e) => setCategorie(e.target.value)}
            />
          </Field>
        </div>
        <div className="w-32">
          <Field label={t("caisse.depenses.montant")}>
            <Input
              placeholder={t("caisse.depenses.montantPlaceholder")}
              value={montant}
              onChange={(e) => setMontant(e.target.value)}
            />
          </Field>
        </div>
      </div>
      <Field label={t("caisse.depenses.description")}>
        <Input
          placeholder={t("caisse.depenses.descriptionPlaceholder")}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </Field>
      <div className="flex gap-2">
        <Button type="submit" disabled={isSubmitting}>
          {t("caisse.depenses.submit")}
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
