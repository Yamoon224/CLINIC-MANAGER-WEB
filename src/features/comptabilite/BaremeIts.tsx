"use client";

import { useCallback, useEffect, useState } from "react";
import { IconPlus, IconTrash } from "@tabler/icons-react";
import { fetchBaremeIts, saveBaremeIts } from "./comptabilite-api";
import type { BaremeTranche } from "./types";
import { Button, Card, Input } from "@/components/ui";
import { apiErrorMessage } from "@/lib/api-client";
import { useTranslation } from "@/lib/i18n/LanguageContext";

type Row = { tranche_min: number; tranche_max: number | null; taux: number };

export function BaremeIts() {
  const { t } = useTranslation();
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const load = useCallback(() => {
    fetchBaremeIts()
      .then((res) =>
        setRows(
          res.data.map((tr: BaremeTranche) => ({
            tranche_min: Number(tr.tranche_min),
            tranche_max: tr.tranche_max === null ? null : Number(tr.tranche_max),
            taux: Number(tr.taux),
          })),
        ),
      )
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  function patch(i: number, p: Partial<Row>) {
    setRows((prev) => prev.map((r, idx) => (idx === i ? { ...r, ...p } : r)));
    setSaved(false);
  }

  async function handleSave() {
    setBusy(true);
    setError(null);
    try {
      await saveBaremeIts(rows);
      setSaved(true);
    } catch (e) {
      setError(apiErrorMessage(e, t("comptabilite.bareme.saveError")));
    } finally {
      setBusy(false);
    }
  }

  if (loading) return null;

  return (
    <div className="flex flex-col gap-3">
      <h3 className="m-0 text-[15px] font-semibold text-heading">
        {t("comptabilite.bareme.titre")}
      </h3>
      <p className="m-0 text-[13px] text-muted">
        {t("comptabilite.bareme.aide")}
      </p>
      <Card className="p-0">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-[12px] text-muted">
              <th className="px-3 py-2 font-medium">
                {t("comptabilite.bareme.min")}
              </th>
              <th className="px-3 py-2 font-medium">
                {t("comptabilite.bareme.max")}
              </th>
              <th className="px-3 py-2 font-medium">
                {t("comptabilite.bareme.taux")}
              </th>
              <th />
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i} className="border-t border-border">
                <td className="px-3 py-1.5">
                  <Input
                    type="number"
                    value={r.tranche_min}
                    onChange={(e) =>
                      patch(i, { tranche_min: Number(e.target.value) })
                    }
                  />
                </td>
                <td className="px-3 py-1.5">
                  <Input
                    type="number"
                    placeholder="∞"
                    value={r.tranche_max ?? ""}
                    onChange={(e) =>
                      patch(i, {
                        tranche_max:
                          e.target.value === "" ? null : Number(e.target.value),
                      })
                    }
                  />
                </td>
                <td className="px-3 py-1.5">
                  <Input
                    type="number"
                    step="any"
                    value={r.taux}
                    onChange={(e) => patch(i, { taux: Number(e.target.value) })}
                  />
                </td>
                <td className="px-3 py-1.5 text-right">
                  <button
                    type="button"
                    onClick={() =>
                      setRows((prev) => prev.filter((_, idx) => idx !== i))
                    }
                    className="text-danger hover:text-danger/70"
                    aria-label={t("common.delete")}
                  >
                    <IconTrash size={15} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
      {error && <p className="text-sm text-danger">{error}</p>}
      <div className="flex items-center gap-3">
        <Button
          variant="light"
          size="sm"
          icon={<IconPlus size={14} />}
          onClick={() =>
            setRows((prev) => [
              ...prev,
              { tranche_min: 0, tranche_max: null, taux: 0 },
            ])
          }
        >
          {t("comptabilite.bareme.ajouter")}
        </Button>
        <Button disabled={busy} onClick={handleSave}>
          {t("common.save")}
        </Button>
        {saved && (
          <span className="text-sm text-success">
            {t("comptabilite.bareme.enregistre")}
          </span>
        )}
      </div>
    </div>
  );
}
