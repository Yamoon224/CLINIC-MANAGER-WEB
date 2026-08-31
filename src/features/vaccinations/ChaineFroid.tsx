"use client";

import { useCallback, useEffect, useState } from "react";
import { IconAlertTriangle, IconThermometer } from "@tabler/icons-react";
import { addReleveTemperature, fetchChaineFroid } from "./vaccinations-api";
import type { ReleveTemperature } from "./types";
import {
  Badge,
  Button,
  Card,
  DataTable,
  Input,
  StatCard,
  type Column,
} from "@/components/ui";
import { useTranslation } from "@/lib/i18n/LanguageContext";

export function ChaineFroid() {
  const { t } = useTranslation();
  const [releves, setReleves] = useState<ReleveTemperature[]>([]);
  const [temperature, setTemperature] = useState("");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    fetchChaineFroid(page)
      .then((res) => {
        setReleves(res.data);
        setTotal(res.meta.total);
      })
      .finally(() => setLoading(false));
  }, [page]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleSubmit() {
    if (!temperature) return;
    setIsSubmitting(true);
    try {
      await addReleveTemperature({
        releve_at: new Date().toISOString(),
        temperature: Number(temperature),
        notes: notes || undefined,
      });
      setTemperature("");
      setNotes("");
      load();
    } finally {
      setIsSubmitting(false);
    }
  }

  const anomaliesCount = releves.filter((r) => r.anomalie).length;

  const columns: Column<ReleveTemperature>[] = [
    {
      key: "date",
      header: t("common.date"),
      cell: (r) =>
        r.releve_at ? new Date(r.releve_at).toLocaleString("fr-FR") : "-",
    },
    {
      key: "temp",
      header: t("vaccinations.temperaturePlaceholder"),
      className: "font-semibold text-heading",
      cell: (r) => `${r.temperature}°C`,
    },
    {
      key: "notes",
      header: t("vaccinations.notesPlaceholder"),
      cell: (r) => <span className="text-muted">{r.notes ?? "—"}</span>,
    },
    {
      key: "statut",
      header: t("common.status"),
      cell: (r) =>
        r.anomalie ? (
          <Badge tone="danger" border>
            {t("vaccinations.outOfRange")}
          </Badge>
        ) : (
          <Badge tone="success" border>
            OK
          </Badge>
        ),
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-4">
        <StatCard
          icon={<IconThermometer size={18} />}
          label={t("vaccinations.statTotalReleves")}
          value={total}
          tone="primary"
        />
        <StatCard
          icon={<IconAlertTriangle size={18} />}
          label={t("vaccinations.statAnomalies")}
          value={anomaliesCount}
          tone="danger"
        />
      </div>

      <Card className="flex flex-wrap items-end gap-2">
        <Input
          placeholder={t("vaccinations.temperaturePlaceholder")}
          value={temperature}
          onChange={(e) => setTemperature(e.target.value)}
          className="w-40"
        />
        <Input
          placeholder={t("vaccinations.notesPlaceholder")}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="flex-1"
        />
        <Button
          variant="outline"
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="whitespace-nowrap"
        >
          {t("vaccinations.saveReleve")}
        </Button>
      </Card>

      <DataTable
        columns={columns}
        rows={releves}
        getRowKey={(r) => r.id}
        page={page}
        perPage={15}
        total={total}
        onPageChange={setPage}
        loading={loading}
        emptyLabel={t("vaccinations.noReleves")}
      />
    </div>
  );
}
