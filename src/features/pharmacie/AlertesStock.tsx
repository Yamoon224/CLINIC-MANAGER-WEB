"use client";

import { useEffect, useState } from "react";
import { IconCalendarClock, IconPackageOff } from "@tabler/icons-react";
import { fetchAlertes } from "./pharmacie-api";
import type { Alertes } from "./types";
import { Badge, StatCard } from "@/components/ui";
import { useTranslation } from "@/lib/i18n/LanguageContext";

export function AlertesStock() {
  const { t } = useTranslation();
  const [alertes, setAlertes] = useState<Alertes | null>(null);

  useEffect(() => {
    fetchAlertes().then(setAlertes);
  }, []);

  if (!alertes) return null;

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-4">
        <StatCard
          icon={<IconPackageOff size={18} />}
          label={t("dashboard.pharmacie.rupturesStock")}
          value={alertes.ruptures.length}
          tone="danger"
        />
        <StatCard
          icon={<IconCalendarClock size={18} />}
          label={t("dashboard.pharmacie.peremptionsProches")}
          value={alertes.peremptions_proches.length}
          tone="warning"
        />
      </div>
      <div>
        <h3 className="font-medium text-heading mb-2">{t("pharmacie.rupturesTitle")}</h3>
        <ul className="text-sm flex flex-col gap-2">
          {alertes.ruptures.map((m) => (
            <li
              key={m.id}
              className="flex items-center justify-between rounded-[5px] border border-danger/30 bg-danger-light p-2"
            >
              <span>
                {t("pharmacie.ruptureItem", { dci: m.dci, stock: m.stock_disponible, seuil: m.seuil_alerte })}
              </span>
              <Badge tone="danger">{t("pharmacie.ruptureBadge")}</Badge>
            </li>
          ))}
          {alertes.ruptures.length === 0 && (
            <li className="text-muted">{t("pharmacie.noRuptures")}</li>
          )}
        </ul>
      </div>

      <div>
        <h3 className="font-medium text-heading mb-2">{t("pharmacie.expiringTitle")}</h3>
        <ul className="text-sm flex flex-col gap-2">
          {alertes.peremptions_proches.map((lot) => (
            <li
              key={lot.id}
              className="flex items-center justify-between rounded-[5px] border border-warning/30 bg-warning-light p-2"
            >
              <span>
                {t("pharmacie.expiringItem", {
                  dci: lot.medicament.dci,
                  lot: lot.numero_lot,
                  date: lot.date_peremption ?? "",
                  stock: lot.quantite_restante,
                })}
              </span>
              <Badge tone="warning">{t("pharmacie.expiringBadge")}</Badge>
            </li>
          ))}
          {alertes.peremptions_proches.length === 0 && (
            <li className="text-muted">{t("pharmacie.noExpiring")}</li>
          )}
        </ul>
      </div>
    </div>
  );
}
