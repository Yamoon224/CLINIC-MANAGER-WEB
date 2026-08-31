"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { IconAlertTriangle, IconFlask } from "@tabler/icons-react";
import {
  fetchFeuilleLabo,
  saveFeuilleLabo,
  validerFeuilleLabo,
} from "./laboratoire-api";
import type { FeuilleLabo, FeuilleParametre } from "./types";
import { apiErrorMessage } from "@/lib/api-client";
import { Badge, Button, Card, Input, Textarea } from "@/components/ui";
import { useTranslation } from "@/lib/i18n/LanguageContext";

/** Évaluation indicative côté client (le backend fait foi). */
function evaluer(p: FeuilleParametre, valeur: string): "critique" | "anormal" | null {
  const v = valeur.trim();
  if (!v) return null;
  const n = Number(v);
  if (!Number.isNaN(n) && v !== "") {
    const critMin = p.valeur_critique_min;
    const critMax = p.valeur_critique_max;
    if (
      (critMin !== null && n < Number(critMin)) ||
      (critMax !== null && n > Number(critMax))
    )
      return "critique";
    const refMin = p.valeur_ref_min;
    const refMax = p.valeur_ref_max;
    if (
      (refMin !== null && n < Number(refMin)) ||
      (refMax !== null && n > Number(refMax))
    )
      return "anormal";
    return null;
  }
  const low = v.toLowerCase();
  const has = (kw: string | null) =>
    kw
      ? kw
          .split(",")
          .map((k) => k.trim().toLowerCase())
          .filter(Boolean)
          .some((k) => low.includes(k))
      : false;
  if (has(p.valeurs_critiques)) return "critique";
  if (has(p.valeurs_anormales)) return "anormal";
  return null;
}

function refLabel(p: FeuilleParametre): string {
  if (p.valeur_ref_min !== null || p.valeur_ref_max !== null) {
    return `${p.valeur_ref_min ?? "–"} – ${p.valeur_ref_max ?? "–"}${
      p.unite ? ` ${p.unite}` : ""
    }`;
  }
  if (p.valeurs_anormales || p.valeurs_critiques) {
    return [p.valeurs_critiques, p.valeurs_anormales].filter(Boolean).join(" / ");
  }
  return "—";
}

export function FeuilleResultats({
  consultationId,
  canEdit = false,
  onChanged,
}: {
  consultationId: number;
  canEdit?: boolean;
  onChanged?: () => void;
}) {
  const { t } = useTranslation();
  const [feuille, setFeuille] = useState<FeuilleLabo | null>(null);
  const [values, setValues] = useState<Record<string, string>>({});
  const [commentaire, setCommentaire] = useState("");
  const [busy, setBusy] = useState<"save" | "validate" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const key = (demandeId: number, parametreId: number) =>
    `${demandeId}:${parametreId}`;

  const load = useCallback(() => {
    fetchFeuilleLabo(consultationId)
      .then((res) => {
        setFeuille(res.data);
        setCommentaire(res.data.commentaire ?? "");
        const initial: Record<string, string> = {};
        res.data.analyses.forEach((a) =>
          a.parametres.forEach((p) => {
            initial[key(a.demande_analyse_id, p.id)] = p.valeur ?? "";
          }),
        );
        setValues(initial);
      })
      .catch(() => setError(t("laboratoire.feuille.loadError")))
      .finally(() => setLoading(false));
  }, [consultationId, t]);

  useEffect(() => {
    load();
  }, [load]);

  const dirty = useMemo(() => {
    if (!feuille) return false;
    return feuille.analyses.some((a) =>
      a.parametres.some(
        (p) => (values[key(a.demande_analyse_id, p.id)] ?? "") !== (p.valeur ?? ""),
      ),
    );
  }, [feuille, values]);

  async function handleSave() {
    if (!feuille) return;
    setBusy("save");
    setError(null);
    const lignes = feuille.analyses.flatMap((a) =>
      a.parametres.map((p) => ({
        demande_analyse_id: a.demande_analyse_id,
        analyse_parametre_id: p.id,
        valeur: values[key(a.demande_analyse_id, p.id)] ?? "",
      })),
    );
    try {
      const res = await saveFeuilleLabo(consultationId, lignes);
      setFeuille(res.data);
      onChanged?.();
    } catch (e) {
      setError(apiErrorMessage(e, t("laboratoire.feuille.saveError")));
    } finally {
      setBusy(null);
    }
  }

  async function handleValidate() {
    setBusy("validate");
    setError(null);
    try {
      const res = await validerFeuilleLabo(consultationId, commentaire || undefined);
      setFeuille(res.data);
      onChanged?.();
    } catch (e) {
      setError(apiErrorMessage(e, t("laboratoire.feuille.validateError")));
    } finally {
      setBusy(null);
    }
  }

  if (loading) return <p className="text-sm text-muted">{t("common.loading")}</p>;
  if (!feuille || feuille.analyses.length === 0) {
    return (
      <p className="text-sm text-muted">{t("laboratoire.feuille.aucune")}</p>
    );
  }

  const readOnly = !canEdit || feuille.statut_global === "valide";

  return (
    <div className="flex flex-col gap-4">
      {error && (
        <p className="rounded-[5px] bg-danger-light px-3 py-2 text-sm text-danger">
          {error}
        </p>
      )}

      {feuille.analyses.map((a) => (
        <Card key={a.demande_analyse_id} className="p-0">
          <div className="flex items-center gap-2 border-b border-border px-4 py-2.5">
            <IconFlask size={15} className="text-primary" />
            <span className="text-[14px] font-semibold text-heading">
              {a.analyse.nom}
            </span>
            {a.urgente && (
              <Badge tone="danger" border>
                {t("laboratoire.urgent")}
              </Badge>
            )}
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[12px] text-muted">
                <th className="px-4 py-1.5 font-medium">
                  {t("laboratoire.feuille.colParametre")}
                </th>
                <th className="px-4 py-1.5 font-medium">
                  {t("laboratoire.feuille.colValeur")}
                </th>
                <th className="px-4 py-1.5 font-medium">
                  {t("laboratoire.feuille.colRef")}
                </th>
              </tr>
            </thead>
            <tbody>
              {a.parametres.map((p) => {
                const val = values[key(a.demande_analyse_id, p.id)] ?? "";
                const flag = evaluer(p, val);
                return (
                  <tr key={p.id} className="border-t border-border">
                    <td className="px-4 py-1.5 text-heading">{p.nom}</td>
                    <td className="px-4 py-1.5">
                      {readOnly ? (
                        <span
                          className={
                            flag === "critique"
                              ? "font-bold text-danger"
                              : flag === "anormal"
                                ? "font-medium text-warning"
                                : "text-heading"
                          }
                        >
                          {val || "—"} {p.unite}
                        </span>
                      ) : (
                        <div className="flex items-center gap-2">
                          <Input
                            value={val}
                            onChange={(e) =>
                              setValues((prev) => ({
                                ...prev,
                                [key(a.demande_analyse_id, p.id)]: e.target.value,
                              }))
                            }
                            className="max-w-[140px]"
                          />
                          {p.unite && (
                            <span className="text-xs text-muted">{p.unite}</span>
                          )}
                          {flag && (
                            <Badge tone={flag === "critique" ? "danger" : "warning"}>
                              {flag === "critique"
                                ? t("laboratoire.critique")
                                : t("laboratoire.saisieModal.abnormal")}
                            </Badge>
                          )}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-1.5 text-muted">{refLabel(p)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Card>
      ))}

      {feuille.analyses.some((a) => a.parametres.some((p) => p.critique)) && (
        <p className="flex items-center gap-1.5 text-sm text-danger">
          <IconAlertTriangle size={15} />
          {t("laboratoire.feuille.critiqueNotice")}
        </p>
      )}

      {canEdit && feuille.statut_global !== "valide" && (
        <div className="flex flex-col gap-3">
          <Textarea
            value={commentaire}
            onChange={(e) => setCommentaire(e.target.value)}
            placeholder={t("laboratoire.feuille.commentairePlaceholder")}
            rows={2}
          />
          <div className="flex flex-wrap justify-end gap-2">
            <Button
              variant="light"
              onClick={handleSave}
              disabled={busy !== null || !dirty}
            >
              {busy === "save"
                ? t("laboratoire.saisieModal.submitting")
                : t("laboratoire.feuille.enregistrer")}
            </Button>
            <Button
              onClick={handleValidate}
              disabled={busy !== null || feuille.statut_global !== "a_valider"}
            >
              {busy === "validate"
                ? t("laboratoire.saisieModal.submitting")
                : t("laboratoire.feuille.validerBiologiste")}
            </Button>
          </div>
        </div>
      )}

      {feuille.statut_global === "valide" && feuille.commentaire && (
        <p className="text-sm italic text-muted">{feuille.commentaire}</p>
      )}
    </div>
  );
}
