"use client";

import { useCallback, useEffect, useState } from "react";
import {
  IconCashBanknote,
  IconReceipt2,
  IconTrendingUp,
  IconWallet,
} from "@tabler/icons-react";
import { fetchEtatFinancier } from "./comptabilite-api";
import { fcfa } from "./format";
import type { EtatFinancier as EtatFinancierData } from "./types";
import { ApexChart } from "@/components/charts/ApexChart";
import { Card, DateInput, Field, StatCard } from "@/components/ui";
import { useTranslation } from "@/lib/i18n/LanguageContext";

export function EtatFinancier() {
  const { t } = useTranslation();
  const [data, setData] = useState<EtatFinancierData | null>(null);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const load = useCallback(() => {
    fetchEtatFinancier({ from: from || undefined, to: to || undefined }).then(
      (res) => setData(res.data),
    );
  }, [from, to]);

  useEffect(() => {
    load();
  }, [load]);

  if (!data) return <p className="text-sm text-muted">{t("common.loading")}</p>;

  const cats = data.charges_par_categorie;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-end gap-3">
        <Field label={t("comptabilite.journal.du")}>
          <DateInput value={from} onChange={(e) => setFrom(e.target.value)} />
        </Field>
        <Field label={t("comptabilite.journal.au")}>
          <DateInput value={to} onChange={(e) => setTo(e.target.value)} />
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label={t("comptabilite.etat.produits")}
          value={fcfa(data.produits)}
          tone="success"
          icon={<IconCashBanknote size={18} />}
        />
        <StatCard
          label={t("comptabilite.etat.charges")}
          value={fcfa(data.charges)}
          tone="danger"
          icon={<IconReceipt2 size={18} />}
        />
        <StatCard
          label={t("comptabilite.etat.resultat")}
          value={fcfa(data.resultat)}
          tone={data.resultat >= 0 ? "primary" : "warning"}
          icon={<IconTrendingUp size={18} />}
        />
        <StatCard
          label={t("comptabilite.etat.tresorerie")}
          value={fcfa(data.tresorerie)}
          tone="info"
          icon={<IconWallet size={18} />}
        />
      </div>

      {cats.length > 0 && (
        <div className="grid gap-4 lg:grid-cols-2">
          <Card className="p-4">
            <h3 className="m-0 mb-3 text-[15px] font-semibold text-heading">
              {t("comptabilite.etat.chargesParCategorie")}
            </h3>
            <ApexChart
              type="bar"
              height={260}
              series={[
                {
                  name: t("comptabilite.etat.charges"),
                  data: cats.map((c) => c.total),
                },
              ]}
              options={{
                xaxis: { categories: cats.map((c) => c.categorie) },
                plotOptions: { bar: { horizontal: true, borderRadius: 4 } },
              }}
              colors={["#EF1E1E"]}
            />
          </Card>
          <Card className="p-0">
            <table className="w-full text-sm">
              <tbody>
                {cats.map((c) => (
                  <tr key={c.categorie} className="border-b border-border">
                    <td className="px-4 py-2 capitalize text-heading">
                      {c.categorie}
                    </td>
                    <td className="px-4 py-2 text-right text-muted">
                      {fcfa(c.total)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </div>
      )}
    </div>
  );
}
