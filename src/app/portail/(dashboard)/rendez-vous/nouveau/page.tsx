"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  fetchPortailCreneauxDisponibles,
  fetchPortailPraticiens,
  reserverRendezVous,
} from "@/features/portail/portail-api";
import {
  RENDEZ_VOUS_TYPES,
  type PortailPraticien,
  type RendezVousType,
} from "@/features/portail/types";
import { Button, Card, Field, PageHeader, Select, Textarea, Input } from "@/components/ui";
import { useTranslation } from "@/lib/i18n/LanguageContext";

export default function PortailNouveauRendezVousPage() {
  const router = useRouter();
  const { t, locale } = useTranslation();

  const [praticiens, setPraticiens] = useState<PortailPraticien[]>([]);
  const [praticienId, setPraticienId] = useState<number | "">("");
  const [type, setType] = useState<RendezVousType>("consultation");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));

  const [creneaux, setCreneaux] = useState<string[]>([]);
  const [startsAt, setStartsAt] = useState("");
  const [motif, setMotif] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchPortailPraticiens().then(setPraticiens);
  }, []);

  useEffect(() => {
    (async () => {
      setStartsAt("");
      if (!praticienId || !date) {
        setCreneaux([]);
        return;
      }
      setCreneaux(await fetchPortailCreneauxDisponibles(praticienId, type, date));
    })();
  }, [praticienId, type, date]);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    if (!praticienId || !startsAt) {
      setError(t("portail.rendezVous.form.requiredError"));
      return;
    }
    setIsSubmitting(true);
    try {
      await reserverRendezVous({
        praticien_id: praticienId,
        type,
        starts_at: startsAt,
        motif: motif || undefined,
      });
      router.push("/portail/rendez-vous");
    } catch {
      setError(t("portail.rendezVous.form.submitError"));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title={t("portail.rendezVous.form.title")} />

      <Card>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label={t("portail.rendezVous.form.praticien")}>
              <Select
                value={praticienId}
                onChange={(e) =>
                  setPraticienId(e.target.value ? Number(e.target.value) : "")
                }
              >
                <option value="">-</option>
                {praticiens.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </Select>
            </Field>

            <Field label={t("portail.rendezVous.form.type")}>
              <Select value={type} onChange={(e) => setType(e.target.value as RendezVousType)}>
                {RENDEZ_VOUS_TYPES.map((rt) => (
                  <option key={rt} value={rt}>
                    {t(`rendezvous.type.${rt}`)}
                  </option>
                ))}
              </Select>
            </Field>

            <Field label={t("portail.rendezVous.form.date")}>
              <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </Field>
          </div>

          <Field label={t("portail.rendezVous.form.creneauDisponible")}>
            {praticienId ? (
              creneaux.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {creneaux.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setStartsAt(c)}
                      className={`rounded-lg border px-3 py-1.5 text-sm transition-colors ${
                        startsAt === c
                          ? "border-primary bg-primary text-white"
                          : "border-border bg-surface hover:bg-primary-light/60"
                      }`}
                    >
                      {new Date(c).toLocaleTimeString(locale === "en" ? "en-US" : "fr-FR", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted">{t("portail.rendezVous.form.noCreneaux")}</p>
              )
            ) : (
              <p className="text-sm text-muted">{t("portail.rendezVous.form.choosePraticien")}</p>
            )}
          </Field>

          <Field label={t("portail.rendezVous.form.motif")}>
            <Textarea
              placeholder={t("portail.rendezVous.form.motifPlaceholder")}
              value={motif}
              onChange={(e) => setMotif(e.target.value)}
              rows={2}
            />
          </Field>

          {error && (
            <p className="rounded-lg bg-danger-light px-3 py-2 text-sm text-danger">{error}</p>
          )}

          <div className="flex gap-2">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting
                ? t("portail.rendezVous.form.submitting")
                : t("portail.rendezVous.form.submit")}
            </Button>
            <Button type="button" variant="outline" onClick={() => router.push("/portail/rendez-vous")}>
              {t("common.cancel")}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
