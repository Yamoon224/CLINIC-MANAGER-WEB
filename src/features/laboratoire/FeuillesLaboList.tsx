"use client";

import { useCallback, useEffect, useState } from "react";
import { IconArrowLeft, IconFlask } from "@tabler/icons-react";
import { fetchFeuillesLabo } from "./laboratoire-api";
import { FeuilleResultats } from "./FeuilleResultats";
import type { FeuilleLaboListItem } from "./types";
import { Badge, Button, DataTable, type Column } from "@/components/ui";
import { useTranslation } from "@/lib/i18n/LanguageContext";

export function FeuillesLaboList({ canEdit }: { canEdit: boolean }) {
  const { t } = useTranslation();
  const [rows, setRows] = useState<FeuilleLaboListItem[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<FeuilleLaboListItem | null>(null);

  const load = useCallback(() => {
    fetchFeuillesLabo(page)
      .then((res) => {
        setRows(res.data);
        setTotal(res.meta.total);
      })
      .finally(() => setLoading(false));
  }, [page]);

  useEffect(() => {
    load();
  }, [load]);

  if (selected) {
    return (
      <div className="flex flex-col gap-4">
        <button
          type="button"
          onClick={() => {
            setSelected(null);
            load();
          }}
          className="inline-flex w-fit items-center gap-1 text-sm font-semibold text-heading hover:text-primary"
        >
          <IconArrowLeft size={15} />
          {t("laboratoire.feuille.retourListe")}
        </button>
        <div>
          <h3 className="m-0 text-[15px] font-semibold text-heading">
            {selected.patient.prenom} {selected.patient.nom}
          </h3>
          <p className="m-0 text-[13px] text-muted">
            {selected.motif} · {selected.patient.numero_dossier}
          </p>
        </div>
        <FeuilleResultats
          consultationId={selected.consultation_id}
          canEdit={canEdit}
        />
      </div>
    );
  }

  const columns: Column<FeuilleLaboListItem>[] = [
    {
      key: "patient",
      header: t("laboratoire.colPatient"),
      cell: (r) => (
        <span className="font-semibold text-heading">
          {r.patient.prenom} {r.patient.nom}
        </span>
      ),
    },
    { key: "motif", header: t("consultations.motif"), cell: (r) => r.motif ?? "-" },
    {
      key: "date",
      header: t("laboratoire.feuille.colDate"),
      cell: (r) =>
        r.date
          ? new Date(r.date).toLocaleDateString("fr-FR", { dateStyle: "medium" })
          : "-",
    },
    {
      key: "etat",
      header: t("common.status"),
      cell: (r) =>
        r.analyses_a_faire > 0 ? (
          <Badge tone="warning" border>
            {t("laboratoire.feuille.aFaire", { count: r.analyses_a_faire })}
          </Badge>
        ) : r.analyses_a_valider > 0 ? (
          <Badge tone="primary" border>
            {t("laboratoire.feuille.aValider", { count: r.analyses_a_valider })}
          </Badge>
        ) : (
          <Badge tone="success" border>
            {t("laboratoire.statutValide")}
          </Badge>
        ),
    },
    {
      key: "actions",
      header: "",
      className: "text-right",
      headClassName: "text-right",
      cell: (r) => (
        <div className="flex justify-end">
          <Button
            variant="outline"
            size="sm"
            icon={<IconFlask size={14} />}
            onClick={() => setSelected(r)}
          >
            {t("laboratoire.feuille.ouvrir")}
          </Button>
        </div>
      ),
    },
  ];

  return (
    <DataTable
      columns={columns}
      rows={rows}
      getRowKey={(r) => r.consultation_id}
      page={page}
      perPage={15}
      total={total}
      onPageChange={setPage}
      loading={loading}
      emptyLabel={t("laboratoire.feuille.listeVide")}
    />
  );
}
