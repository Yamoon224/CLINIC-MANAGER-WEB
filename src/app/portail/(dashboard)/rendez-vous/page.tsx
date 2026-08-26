"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { CalendarClock } from "lucide-react";
import { annulerRendezVous, fetchMesRendezVous } from "@/features/portail/portail-api";
import type { PortailRendezVous } from "@/features/portail/types";
import { Badge, Button, Card, PageHeader } from "@/components/ui";
import type { Tone } from "@/components/ui";
import { useTranslation } from "@/lib/i18n/LanguageContext";

const STATUT_TONE: Record<PortailRendezVous["statut"], Tone> = {
  programme: "primary",
  confirme: "primary",
  arrive: "accent",
  en_consultation: "accent",
  honore: "success",
  absent: "warning",
  annule: "danger",
  reporte: "warning",
};

const ANNULABLE = ["programme", "confirme", "arrive", "en_consultation"];

export default function PortailRendezVousPage() {
  const { t, locale } = useTranslation();
  const [rendezVous, setRendezVous] = useState<PortailRendezVous[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [cancellingId, setCancellingId] = useState<number | null>(null);

  const load = useCallback(() => {
    fetchMesRendezVous().then(setRendezVous);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const aVenirCount = useMemo(
    () => rendezVous?.filter((rdv) => ANNULABLE.includes(rdv.statut)).length ?? 0,
    [rendezVous],
  );

  async function handleCancel(id: number) {
    if (!window.confirm(t("portail.rendezVous.cancelConfirm"))) return;
    setError(null);
    setCancellingId(id);
    try {
      await annulerRendezVous(id);
      load();
    } catch {
      setError(t("portail.rendezVous.cancelError"));
    } finally {
      setCancellingId(null);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={t("portail.rendezVous.title")}
        actions={
          <Link href="/portail/rendez-vous/nouveau">
            <Button>{t("portail.rendezVous.newRendezVous")}</Button>
          </Link>
        }
      />

      {error && (
        <p className="rounded-lg bg-danger-light px-3 py-2 text-sm text-danger">{error}</p>
      )}

      {rendezVous !== null && rendezVous.length > 0 && (
        <Card className="flex items-start gap-3 p-4">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-light text-primary">
            <CalendarClock size={18} />
          </span>
          <div>
            <div className="text-xs font-medium text-muted">{t("portail.rendezVous.statAVenir")}</div>
            <div className="mt-1 text-2xl font-semibold text-primary">{aVenirCount}</div>
          </div>
        </Card>
      )}

      {rendezVous === null ? (
        <p className="text-sm text-muted">{t("common.loading")}</p>
      ) : rendezVous.length === 0 ? (
        <Card>
          <p className="text-sm text-muted">{t("portail.rendezVous.noResults")}</p>
        </Card>
      ) : (
        <div className="flex flex-col gap-3">
          {rendezVous.map((rdv) => (
            <Card key={rdv.id} className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="font-medium">
                  {new Date(rdv.starts_at).toLocaleString(locale === "en" ? "en-US" : "fr-FR", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                </p>
                <p className="text-sm text-muted">
                  {t(`rendezvous.type.${rdv.type}`)} {t("portail.rendezVous.with")}{" "}
                  {rdv.praticien.name}
                  {rdv.motif ? ` — ${rdv.motif}` : ""}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Badge tone={STATUT_TONE[rdv.statut]}>{t(`rendezvous.statut.${rdv.statut}`)}</Badge>
                {ANNULABLE.includes(rdv.statut) && (
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={cancellingId === rdv.id}
                    onClick={() => handleCancel(rdv.id)}
                  >
                    {t("portail.rendezVous.cancel")}
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
