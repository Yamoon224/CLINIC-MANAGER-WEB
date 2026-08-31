"use client";

import { useEffect, useState } from "react";
import {
  fetchEmployeRemuneration,
  fetchRubriques,
  saveEmployeRemuneration,
} from "./comptabilite-api";
import type { RubriquePaie } from "./types";
import { Button, Field, Input } from "@/components/ui";
import { apiErrorMessage } from "@/lib/api-client";
import { useTranslation } from "@/lib/i18n/LanguageContext";

interface AssignedRow {
  rubrique_paie_id: number;
  montant: number | null;
  taux: number | null;
}

export function EmployeRemunerationForm({
  employeId,
  onSaved,
  onCancel,
}: {
  employeId: number;
  onSaved: () => void;
  onCancel: () => void;
}) {
  const { t } = useTranslation();
  const [rubriques, setRubriques] = useState<RubriquePaie[]>([]);
  const [salaireBase, setSalaireBase] = useState(0);
  const [assigned, setAssigned] = useState<Map<number, AssignedRow>>(new Map());
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([fetchRubriques(), fetchEmployeRemuneration(employeId)])
      .then(([rub, rem]) => {
        setRubriques(rub.data.filter((r) => r.actif));
        setSalaireBase(Number(rem.data.salaire_base));
        const map = new Map<number, AssignedRow>();
        rem.data.rubriques.forEach((r) =>
          map.set(r.id, {
            rubrique_paie_id: r.id,
            montant: r.pivot?.montant ? Number(r.pivot.montant) : null,
            taux: r.pivot?.taux ? Number(r.pivot.taux) : null,
          }),
        );
        setAssigned(map);
      })
      .finally(() => setLoading(false));
  }, [employeId]);

  function toggle(id: number) {
    setAssigned((prev) => {
      const next = new Map(prev);
      if (next.has(id)) next.delete(id);
      else next.set(id, { rubrique_paie_id: id, montant: null, taux: null });
      return next;
    });
  }

  function setOverride(id: number, patch: Partial<AssignedRow>) {
    setAssigned((prev) => {
      const next = new Map(prev);
      const cur = next.get(id);
      if (cur) next.set(id, { ...cur, ...patch });
      return next;
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await saveEmployeRemuneration(employeId, {
        salaire_base: salaireBase,
        rubriques: Array.from(assigned.values()),
      });
      onSaved();
    } catch (err) {
      setError(apiErrorMessage(err, t("comptabilite.remuneration.saveError")));
    } finally {
      setBusy(false);
    }
  }

  if (loading) return <p className="text-sm text-muted">{t("common.loading")}</p>;

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Field label={t("comptabilite.remuneration.salaireBase")} required>
        <Input
          type="number"
          min={0}
          value={salaireBase}
          onChange={(e) => setSalaireBase(Number(e.target.value))}
        />
      </Field>

      <div className="flex flex-col gap-1">
        <p className="m-0 text-[13px] font-bold uppercase tracking-wide text-muted">
          {t("comptabilite.remuneration.rubriques")}
        </p>
        {rubriques.map((r) => {
          const row = assigned.get(r.id);
          return (
            <div
              key={r.id}
              className="flex flex-wrap items-center gap-3 rounded-[5px] border border-border px-3 py-2 text-sm"
            >
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={row !== undefined}
                  onChange={() => toggle(r.id)}
                />
                <span className="font-medium text-heading">{r.libelle}</span>
                <span className="text-muted">
                  ({t(`comptabilite.categorie.${r.categorie}`)})
                </span>
              </label>
              {row && r.mode === "fixe" && (
                <Input
                  type="number"
                  className="max-w-[130px]"
                  placeholder={`${Number(r.montant ?? 0).toLocaleString("fr-FR")} (défaut)`}
                  value={row.montant ?? ""}
                  onChange={(e) =>
                    setOverride(r.id, {
                      montant:
                        e.target.value === "" ? null : Number(e.target.value),
                    })
                  }
                />
              )}
              {row && r.mode !== "fixe" && (
                <Input
                  type="number"
                  step="any"
                  className="max-w-[130px]"
                  placeholder={`${r.taux ?? 0} (défaut)`}
                  value={row.taux ?? ""}
                  onChange={(e) =>
                    setOverride(r.id, {
                      taux: e.target.value === "" ? null : Number(e.target.value),
                    })
                  }
                />
              )}
            </div>
          );
        })}
      </div>

      {error && <p className="text-sm text-danger">{error}</p>}
      <div className="flex justify-end gap-2">
        <Button type="button" variant="light" onClick={onCancel}>
          {t("common.cancel")}
        </Button>
        <Button type="submit" disabled={busy}>
          {t("common.save")}
        </Button>
      </div>
    </form>
  );
}
