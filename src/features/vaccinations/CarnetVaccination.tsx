"use client";

import { useCallback, useEffect, useState } from "react";
import { administrerVaccin, fetchCarnet, fetchVaccins } from "./vaccinations-api";
import type { Carnet, Vaccin } from "./types";
import { Badge, Button, Card, Input, Pagination, Select, Textarea } from "@/components/ui";
import { useTranslation } from "@/lib/i18n/LanguageContext";

export function CarnetVaccination({ patientId }: { patientId: number }) {
  const { t } = useTranslation();
  const [carnet, setCarnet] = useState<Carnet | null>(null);
  const [vaccins, setVaccins] = useState<Vaccin[]>([]);
  const [vaccinId, setVaccinId] = useState<number | "">("");
  const [dateAdministration, setDateAdministration] = useState(
    new Date().toISOString().slice(0, 10),
  );
  const [mapiSurvenue, setMapiSurvenue] = useState(false);
  const [mapiDetails, setMapiDetails] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const load = useCallback(() => {
    fetchCarnet(patientId, page).then((res) => {
      setCarnet(res);
      setTotalPages(res.meta.last_page);
    });
  }, [patientId, page]);

  useEffect(() => {
    load();
    fetchVaccins().then((res) => setVaccins(res.data));
  }, [load]);

  async function handleAdminister() {
    if (!vaccinId) return;
    setIsSubmitting(true);
    setError(null);
    try {
      await administrerVaccin(patientId, {
        vaccin_id: vaccinId,
        date_administration: dateAdministration,
        mapi_survenue: mapiSurvenue,
        mapi_details: mapiDetails || undefined,
      });
      setMapiSurvenue(false);
      setMapiDetails("");
      load();
    } catch {
      setError(t("vaccinations.administerError"));
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!carnet) return null;

  return (
    <div>
      <h2 className="font-semibold text-foreground mb-2">{t("vaccinations.title")}</h2>

      <Card className="p-0 overflow-hidden mb-3">
        <table className="table">
          <thead>
            <tr>
              <th>{t("vaccinations.colVaccin")}</th>
              <th>{t("vaccinations.colDose")}</th>
              <th>{t("common.date")}</th>
              <th>{t("vaccinations.colMapi")}</th>
            </tr>
          </thead>
          <tbody>
            {carnet.data.map((v) => (
              <tr key={v.id}>
                <td>{v.vaccin.nom}</td>
                <td>
                  {v.dose_numero}/{v.vaccin.nombre_doses}
                </td>
                <td>{v.date_administration}</td>
                <td>
                  {v.mapi_survenue ? (
                    <Badge tone="danger">{t("vaccinations.mapiBadge", { details: v.mapi_details ?? "" })}</Badge>
                  ) : (
                    "-"
                  )}
                </td>
              </tr>
            ))}
            {carnet.data.length === 0 && (
              <tr>
                <td colSpan={4} className="text-muted">
                  {t("vaccinations.noVaccinations")}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>
      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />

      {carnet.echeances.length > 0 && (
        <div className="mb-3 text-sm">
          <span className="font-medium text-foreground">{t("vaccinations.upcomingLabel")}</span>
          <span className="text-muted">
            {carnet.echeances
              .map(
                (e) =>
                  t("vaccinations.echeanceItem", { nom: e.vaccin.nom, dose: e.prochaine_dose }) +
                  (e.date_prevue ? ` - ${e.date_prevue}` : ""),
              )
              .join(" · ")}
          </span>
        </div>
      )}

      <Card className="flex flex-col gap-2 max-w-md p-3">
        <div className="flex gap-2">
          <Select
            value={vaccinId}
            onChange={(e) => setVaccinId(e.target.value ? Number(e.target.value) : "")}
            className="flex-1"
          >
            <option value="">{t("vaccinations.selectVaccinPlaceholder")}</option>
            {vaccins.map((v) => (
              <option key={v.id} value={v.id}>
                {v.nom}
              </option>
            ))}
          </Select>
          <Input
            type="date"
            value={dateAdministration}
            onChange={(e) => setDateAdministration(e.target.value)}
            className="w-auto"
          />
        </div>
        <label className="flex items-center gap-2 text-sm text-foreground">
          <input
            type="checkbox"
            checked={mapiSurvenue}
            onChange={(e) => setMapiSurvenue(e.target.checked)}
          />
          {t("vaccinations.mapiCheckboxLabel")}
        </label>
        {mapiSurvenue && (
          <Textarea
            placeholder={t("vaccinations.mapiDetailsPlaceholder")}
            value={mapiDetails}
            onChange={(e) => setMapiDetails(e.target.value)}
            rows={2}
          />
        )}
        {error && <p className="text-sm text-danger">{error}</p>}
        <Button onClick={handleAdminister} disabled={isSubmitting || !vaccinId} className="self-start">
          {t("vaccinations.administer")}
        </Button>
      </Card>
    </div>
  );
}
