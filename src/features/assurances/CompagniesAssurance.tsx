"use client";

import { useEffect, useState } from "react";
import { createCompagnie, fetchCompagnies } from "./assurances-api";
import type { CompagnieAssurance } from "./types";
import { Button, Card, Field, Input } from "@/components/ui";
import { useTranslation } from "@/lib/i18n/LanguageContext";

export function CompagniesAssurance() {
  const { t } = useTranslation();
  const [compagnies, setCompagnies] = useState<CompagnieAssurance[]>([]);
  const [nom, setNom] = useState("");
  const [taux, setTaux] = useState("");
  const [contactTelephone, setContactTelephone] = useState("");
  const [busy, setBusy] = useState(false);

  function load() {
    fetchCompagnies().then((res) => setCompagnies(res.data));
  }

  useEffect(() => {
    load();
  }, []);

  async function handleSubmit() {
    if (!nom || !taux) return;
    setBusy(true);
    try {
      await createCompagnie({
        nom,
        taux_couverture_defaut: Number(taux),
        contact_telephone: contactTelephone || undefined,
      });
      setNom("");
      setTaux("");
      setContactTelephone("");
      load();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <Card className="flex flex-col gap-3">
        <div className="flex gap-2">
          <div className="flex-1">
            <Field label={t("assurances.compagnies.nom")}>
              <Input
                placeholder={t("assurances.compagnies.nomPlaceholder")}
                value={nom}
                onChange={(e) => setNom(e.target.value)}
              />
            </Field>
          </div>
          <div className="w-40">
            <Field label={t("assurances.compagnies.tauxCouverture")}>
              <Input
                placeholder={t("assurances.compagnies.tauxCouverturePlaceholder")}
                value={taux}
                onChange={(e) => setTaux(e.target.value)}
              />
            </Field>
          </div>
        </div>
        <Field label={t("assurances.compagnies.telephone")}>
          <Input
            placeholder={t("assurances.compagnies.telephonePlaceholder")}
            value={contactTelephone}
            onChange={(e) => setContactTelephone(e.target.value)}
          />
        </Field>
        <Button onClick={handleSubmit} disabled={busy} className="self-start">
          {t("assurances.compagnies.submit")}
        </Button>
      </Card>

      <ul className="flex flex-col gap-2 text-sm">
        {compagnies.map((c) => (
          <li
            key={c.id}
            className="flex items-center justify-between rounded-xl border border-border bg-surface p-3"
          >
            <span>
              {c.nom}
              {c.contact_telephone && ` - ${c.contact_telephone}`}
            </span>
            <span className="font-semibold">{c.taux_couverture_defaut}%</span>
          </li>
        ))}
        {compagnies.length === 0 && <li className="text-muted">{t("assurances.compagnies.empty")}</li>}
      </ul>
    </div>
  );
}
