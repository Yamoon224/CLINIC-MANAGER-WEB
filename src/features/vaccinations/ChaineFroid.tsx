"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, Thermometer } from "lucide-react";
import { addReleveTemperature, fetchChaineFroid } from "./vaccinations-api";
import type { ReleveTemperature } from "./types";
import { Badge, Button, Card, Input, Pagination } from "@/components/ui";
import { useTranslation } from "@/lib/i18n/LanguageContext";

export function ChaineFroid() {
  const { t } = useTranslation();
  const [releves, setReleves] = useState<ReleveTemperature[]>([]);
  const [temperature, setTemperature] = useState("");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  function load() {
    fetchChaineFroid(page).then((res) => {
      setReleves(res.data);
      setTotalPages(res.meta.last_page);
    });
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

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

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-4 max-w-lg">
        <Card className="flex items-center gap-3 p-4">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-light text-primary">
            <Thermometer size={18} />
          </span>
          <div className="min-w-0">
            <div className="text-xs font-medium text-muted">{t("vaccinations.statTotalReleves")}</div>
            <div className="mt-1 text-2xl font-semibold text-primary">{releves.length}</div>
          </div>
        </Card>
        <Card className="flex items-center gap-3 p-4">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-danger-light text-danger">
            <AlertTriangle size={18} />
          </span>
          <div className="min-w-0">
            <div className="text-xs font-medium text-muted">{t("vaccinations.statAnomalies")}</div>
            <div className="mt-1 text-2xl font-semibold text-danger">{anomaliesCount}</div>
          </div>
        </Card>
      </div>
      <Card className="flex items-center gap-2 max-w-lg p-3">
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

      <ul className="flex flex-col gap-2 text-sm max-w-lg">
        {releves.map((r) => (
          <li
            key={r.id}
            className={`rounded-lg border p-2 flex items-center justify-between ${r.anomalie ? "border-danger/30 bg-danger-light" : "border-border"}`}
          >
            <span>
              {r.releve_at && new Date(r.releve_at).toLocaleString("fr-FR")} - {r.temperature}°C
            </span>
            {r.anomalie && <Badge tone="danger">{t("vaccinations.outOfRange")}</Badge>}
          </li>
        ))}
        {releves.length === 0 && (
          <li className="text-muted">{t("vaccinations.noReleves")}</li>
        )}
      </ul>
      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
    </div>
  );
}
