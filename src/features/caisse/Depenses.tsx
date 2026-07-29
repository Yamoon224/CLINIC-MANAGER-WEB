"use client";

import { useEffect, useState } from "react";
import { createDepense, fetchDepenses } from "./caisse-api";
import type { Depense } from "./types";
import { Button, Card, Field, Input, Pagination } from "@/components/ui";
import { useTranslation } from "@/lib/i18n/LanguageContext";

export function Depenses() {
  const { t } = useTranslation();
  const [depenses, setDepenses] = useState<Depense[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [categorie, setCategorie] = useState("");
  const [montant, setMontant] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  function load() {
    fetchDepenses(page).then((res) => {
      setDepenses(res.data);
      setTotalPages(res.meta.last_page);
    });
  }

  useEffect(() => {
    load();
  }, [page]);

  async function handleSubmit() {
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
      load();
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <Card className="flex flex-col gap-3">
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
        <Button onClick={handleSubmit} disabled={isSubmitting} className="self-start">
          {t("caisse.depenses.submit")}
        </Button>
      </Card>

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
