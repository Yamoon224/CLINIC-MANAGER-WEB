"use client";

import { useCallback, useEffect, useState } from "react";
import { annuler, fetchWorkList, preleve, saisirResultat, validerBiologiste } from "./laboratoire-api";
import type { DemandeAnalyse } from "./types";
import { Badge, Button, Card, Input, Pagination } from "@/components/ui";
import { useTranslation } from "@/lib/i18n/LanguageContext";

export function WorkList() {
  const { t } = useTranslation();
  const [demandes, setDemandes] = useState<DemandeAnalyse[]>([]);
  const [valeurs, setValeurs] = useState<Record<number, string>>({});
  const [busyId, setBusyId] = useState<number | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const STATUT_LABELS: Record<DemandeAnalyse["statut"], string> = {
    demandee: t("laboratoire.statutDemandee"),
    preleve: t("laboratoire.statutPreleve"),
    valide_technicien: t("laboratoire.statutValideTechnicien"),
    valide: t("laboratoire.statutValide"),
    annulee: t("laboratoire.statutAnnulee"),
  };

  const load = useCallback(() => {
    fetchWorkList(page).then((res) => {
      setDemandes(res.data);
      setTotalPages(res.meta.last_page);
    });
  }, [page]);

  useEffect(() => {
    load();
    const interval = setInterval(load, 10000);
    return () => clearInterval(interval);
  }, [load]);

  async function handlePreleve(id: number) {
    setBusyId(id);
    try {
      await preleve(id);
      load();
    } finally {
      setBusyId(null);
    }
  }

  async function handleSaisirResultat(id: number) {
    const valeur = valeurs[id];
    if (!valeur) return;
    setBusyId(id);
    try {
      await saisirResultat(id, valeur);
      load();
    } finally {
      setBusyId(null);
    }
  }

  async function handleValider(id: number) {
    setBusyId(id);
    try {
      await validerBiologiste(id);
      load();
    } finally {
      setBusyId(null);
    }
  }

  async function handleAnnuler(id: number) {
    setBusyId(id);
    try {
      await annuler(id);
      load();
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <Card className="p-0 overflow-hidden">
        <table className="table">
          <thead>
            <tr>
              <th>{t("laboratoire.colPatient")}</th>
              <th>{t("laboratoire.colAnalyse")}</th>
              <th>{t("common.status")}</th>
              <th>{t("laboratoire.resultat")}</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {demandes.map((d) => (
              <tr
                key={d.id}
                className={d.resultat_critique ? "bg-danger-light" : d.urgente ? "bg-warning-light" : ""}
              >
                <td>
                  {d.patient.prenom} {d.patient.nom}
                  {d.urgente && (
                    <span className="ml-2">
                      <Badge tone="danger">{t("laboratoire.urgent")}</Badge>
                    </span>
                  )}
                </td>
                <td>{d.analyse_type.nom}</td>
                <td>
                  <Badge tone="neutral">{STATUT_LABELS[d.statut]}</Badge>
                </td>
                <td>
                  {d.resultat_valeur ? (
                    <span
                      className={
                        d.resultat_critique
                          ? "font-bold text-danger"
                          : d.resultat_anormal
                            ? "font-medium text-warning"
                            : ""
                      }
                    >
                      {d.resultat_valeur} {d.analyse_type.unite}
                      {d.resultat_critique && t("laboratoire.critique")}
                    </span>
                  ) : (
                    "-"
                  )}
                </td>
                <td>
                  <div className="flex items-center gap-2">
                    {d.statut === "demandee" && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handlePreleve(d.id)}
                        disabled={busyId === d.id}
                      >
                        {t("laboratoire.preleve")}
                      </Button>
                    )}
                    {d.statut === "preleve" && (
                      <span className="flex items-center gap-2">
                        <Input
                          placeholder={t("laboratoire.valeurPlaceholder")}
                          value={valeurs[d.id] ?? ""}
                          onChange={(e) => setValeurs((v) => ({ ...v, [d.id]: e.target.value }))}
                          className="w-24"
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleSaisirResultat(d.id)}
                          disabled={busyId === d.id}
                        >
                          {t("laboratoire.saisir")}
                        </Button>
                      </span>
                    )}
                    {d.statut === "valide_technicien" && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleValider(d.id)}
                        disabled={busyId === d.id}
                      >
                        {t("laboratoire.validerBiologiste")}
                      </Button>
                    )}
                    {d.statut !== "valide" && d.statut !== "annulee" && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleAnnuler(d.id)}
                        disabled={busyId === d.id}
                        className="text-danger hover:bg-danger-light"
                      >
                        {t("common.cancel")}
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {demandes.length === 0 && (
              <tr>
                <td colSpan={5} className="text-muted">
                  {t("laboratoire.noRequests")}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>
      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
    </div>
  );
}
