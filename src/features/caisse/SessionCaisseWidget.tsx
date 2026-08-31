"use client";

import { useCallback, useEffect, useState } from "react";
import { IconWallet } from "@tabler/icons-react";
import { cloturerSession, fetchSessionCourante, ouvrirSession } from "./caisse-api";
import type { SessionCaisse } from "./types";
import { Badge, Button, Card, Input } from "@/components/ui";
import { useTranslation } from "@/lib/i18n/LanguageContext";

export function SessionCaisseWidget() {
  const { t } = useTranslation();
  const [session, setSession] = useState<SessionCaisse | null | undefined>(undefined);
  const [dernierRapport, setDernierRapport] = useState<SessionCaisse | null>(null);
  const [montantOuverture, setMontantOuverture] = useState("20000");
  const [montantCloture, setMontantCloture] = useState("");
  const [busy, setBusy] = useState(false);

  const load = useCallback(() => {
    fetchSessionCourante().then((res) => setSession(res.data));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handleOuvrir() {
    setBusy(true);
    try {
      await ouvrirSession(Number(montantOuverture));
      setDernierRapport(null);
      load();
    } finally {
      setBusy(false);
    }
  }

  async function handleCloturer() {
    if (!session || !montantCloture) return;
    setBusy(true);
    try {
      const { data } = await cloturerSession(session.id, Number(montantCloture));
      setDernierRapport(data);
      setMontantCloture("");
      load();
    } finally {
      setBusy(false);
    }
  }

  if (session === undefined) return null;

  if (!session) {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-foreground/5 text-muted">
            <IconWallet size={18} />
          </span>
          <div className="flex items-center gap-2">
            <h2 className="font-semibold text-heading">{t("caisse.session.title")}</h2>
            <Badge tone="neutral">{t("caisse.session.statutFermee")}</Badge>
          </div>
        </div>
        {dernierRapport && (
          <Card className="text-sm">
            <p className="font-semibold">{t("caisse.session.rapportTitle")}</p>
            <p className="mt-1">
              {t("caisse.session.theorique", { montant: dernierRapport.montant_theorique ?? "" })}
            </p>
            <p>{t("caisse.session.compte", { montant: dernierRapport.montant_cloture ?? "" })}</p>
            <p className={Number(dernierRapport.ecart) !== 0 ? "text-danger font-semibold" : ""}>
              {t("caisse.session.ecart", { montant: dernierRapport.ecart ?? "" })}
            </p>
          </Card>
        )}
        <Card className="flex items-center gap-2">
          <Input
            placeholder={t("caisse.session.fondsInitialPlaceholder")}
            value={montantOuverture}
            onChange={(e) => setMontantOuverture(e.target.value)}
            className="flex-1"
          />
          <Button onClick={handleOuvrir} disabled={busy}>
            {t("caisse.session.ouvrir")}
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-success-light text-success">
          <IconWallet size={18} />
        </span>
        <div className="flex items-center gap-2">
          <h2 className="font-semibold text-heading">{t("caisse.session.title")}</h2>
          <Badge tone="success">{t("caisse.session.statutOuverte")}</Badge>
        </div>
      </div>
      <Card className="flex flex-col gap-3">
        <p className="text-sm">
          {t("caisse.session.ouverte", { montant: session.montant_ouverture })}
        </p>
        <div className="flex items-center gap-2">
          <Input
            placeholder={t("caisse.session.montantComptePlaceholder")}
            value={montantCloture}
            onChange={(e) => setMontantCloture(e.target.value)}
            className="flex-1"
          />
          <Button variant="outline" onClick={handleCloturer} disabled={busy}>
            {t("caisse.session.cloturer")}
          </Button>
        </div>
      </Card>
    </div>
  );
}
