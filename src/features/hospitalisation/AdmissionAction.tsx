"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { admettre, fetchLits } from "./hospitalisation-api";
import type { Lit } from "./types";
import { Button, Card, Field, Input, Select } from "@/components/ui";
import { useTranslation } from "@/lib/i18n/LanguageContext";

export function AdmissionAction({ patientId }: { patientId: number }) {
  const { t } = useTranslation();
  const router = useRouter();
  const [lits, setLits] = useState<Lit[]>([]);
  const [litId, setLitId] = useState<number | "">("");
  const [motif, setMotif] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchLits().then((res) => setLits(res.data.filter((l) => l.statut === "libre")));
  }, []);

  async function handleSubmit() {
    if (!litId || !motif.trim()) {
      setError(t("hospitalisation.admission.errorRequired"));
      return;
    }
    setIsSubmitting(true);
    setError(null);
    try {
      const { data } = await admettre(patientId, { lit_id: litId, motif });
      router.push(`/sejours/${data.id}`);
    } catch {
      setError(t("hospitalisation.admission.errorSubmit"));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Card className="flex flex-col gap-3">
      <span className="font-semibold text-sm">{t("hospitalisation.admission.title")}</span>
      <Field label={t("hospitalisation.admission.lit")}>
        <Select
          value={litId}
          onChange={(e) => setLitId(e.target.value ? Number(e.target.value) : "")}
        >
          <option value="">{t("hospitalisation.admission.litPlaceholder")}</option>
          {lits.map((l) => (
            <option key={l.id} value={l.id}>
              {t("hospitalisation.admission.room", { chambre: l.chambre, numero: l.numero })}
            </option>
          ))}
        </Select>
      </Field>
      <Field label={t("hospitalisation.admission.motif")}>
        <Input
          placeholder={t("hospitalisation.admission.motifPlaceholder")}
          value={motif}
          onChange={(e) => setMotif(e.target.value)}
        />
      </Field>
      {error && (
        <p className="rounded-lg bg-danger-light px-3 py-2 text-sm text-danger">{error}</p>
      )}
      <Button onClick={handleSubmit} disabled={isSubmitting || lits.length === 0} className="self-start">
        {t("hospitalisation.admission.submit")}
      </Button>
      {lits.length === 0 && (
        <p className="text-sm text-muted">{t("hospitalisation.admission.noLitsAvailable")}</p>
      )}
    </Card>
  );
}
