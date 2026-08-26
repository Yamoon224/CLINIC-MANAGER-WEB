"use client";

import { useCallback, useEffect, useState } from "react";
import { Users } from "lucide-react";
import { cloturerSession, fetchSessionsCaisse } from "./caisse-api";
import type { SessionCaisse } from "./types";
import { useAuth } from "@/features/auth/auth-context";
import { Badge, Button, Card, Input } from "@/components/ui";
import { useTranslation } from "@/lib/i18n/LanguageContext";

/**
 * Vue de supervision réservée à l'administrateur : la carte "Session de
 * caisse" ci-dessus ne montre que la session courante *de l'utilisateur
 * connecté*, donc un admin (qui n'ouvre jamais lui-même de tiroir-caisse) n'a
 * normalement aucun moyen de voir — ni de clôturer — la session d'un autre
 * caissier. Le backend autorise déjà l'administrateur à clôturer n'importe
 * quelle session (voir SessionCaisseController::cloturer) ; ce panneau lui en
 * donne concrètement le moyen dans l'interface.
 */
export function SessionsCaisseAdmin() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [sessions, setSessions] = useState<SessionCaisse[] | null>(null);
  const [montants, setMontants] = useState<Record<number, string>>({});
  const [busyId, setBusyId] = useState<number | null>(null);

  const load = useCallback(() => {
    fetchSessionsCaisse("ouverte").then((res) => setSessions(res.data));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (!user?.roles.includes("administrateur")) return null;

  const autres = (sessions ?? []).filter((s) => s.caissier?.id !== user.id);

  async function handleCloturer(session: SessionCaisse) {
    const montant = Number(montants[session.id] ?? "");
    if (!montant) return;
    setBusyId(session.id);
    try {
      await cloturerSession(session.id, montant);
      load();
    } finally {
      setBusyId(null);
    }
  }

  return (
    <Card className="flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-light text-primary">
          <Users size={18} />
        </span>
        <div>
          <h2 className="font-semibold text-foreground">{t("caisse.session.autresTitle")}</h2>
          <p className="text-xs text-muted">{t("caisse.session.autresSubtitle")}</p>
        </div>
      </div>

      {sessions === null ? (
        <p className="text-sm text-muted">{t("common.loading")}</p>
      ) : autres.length === 0 ? (
        <p className="text-sm text-muted">{t("caisse.session.autresEmpty")}</p>
      ) : (
        <div className="flex flex-col gap-2">
          {autres.map((session) => (
            <div
              key={session.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border p-3"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-medium text-foreground">
                    {t("caisse.session.ouvertePar", { nom: session.caissier?.name ?? "?" })}
                  </span>
                  <Badge tone="success">{t("caisse.session.statutOuverte")}</Badge>
                </div>
                <p className="text-xs text-muted">
                  {t("caisse.session.ouverte", { montant: session.montant_ouverture })}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Input
                  placeholder={t("caisse.session.montantComptePlaceholder")}
                  value={montants[session.id] ?? ""}
                  onChange={(e) =>
                    setMontants((m) => ({ ...m, [session.id]: e.target.value }))
                  }
                  className="w-44"
                />
                <Button
                  variant="outline"
                  size="sm"
                  disabled={busyId === session.id}
                  onClick={() => handleCloturer(session)}
                >
                  {t("caisse.session.cloturer")}
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
