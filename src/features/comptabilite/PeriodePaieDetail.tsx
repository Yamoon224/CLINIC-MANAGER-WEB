"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { IconChevronLeft } from "@tabler/icons-react";
import {
  actionPeriode,
  fetchPeriodePaie,
  payerBulletin,
} from "./comptabilite-api";
import { fcfa, formatMonth } from "./format";
import type { BulletinPaie, PeriodePaie } from "./types";
import {
  Badge,
  Button,
  Card,
  DataTable,
  Field,
  Modal,
  PdfButton,
  Select,
  StatCard,
  type Column,
} from "@/components/ui";
import { apiErrorMessage } from "@/lib/api-client";
import { useTranslation } from "@/lib/i18n/LanguageContext";

export function PeriodePaieDetail({ id }: { id: number }) {
  const { t } = useTranslation();
  const [periode, setPeriode] = useState<PeriodePaie | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [payTarget, setPayTarget] = useState<BulletinPaie | null>(null);
  const [mode, setMode] = useState("virement");
  const [detail, setDetail] = useState<BulletinPaie | null>(null);

  const load = useCallback(() => {
    fetchPeriodePaie(id)
      .then((res) => setPeriode(res.data))
      .catch(() => setError(t("comptabilite.paie.loadError")));
  }, [id, t]);

  useEffect(() => {
    load();
  }, [load]);

  async function runAction(action: "recalculer" | "valider" | "cloturer") {
    setBusy(true);
    setError(null);
    try {
      const res = await actionPeriode(id, action);
      setPeriode(res.data);
      load();
    } catch (e) {
      setError(apiErrorMessage(e, t("comptabilite.paie.actionError")));
    } finally {
      setBusy(false);
    }
  }

  async function handlePay() {
    if (!payTarget) return;
    setBusy(true);
    setError(null);
    try {
      await payerBulletin(payTarget.id, mode);
      setPayTarget(null);
      load();
    } catch (e) {
      setError(apiErrorMessage(e, t("comptabilite.paie.payError")));
    } finally {
      setBusy(false);
    }
  }

  if (error && !periode)
    return <p className="text-danger">{error}</p>;
  if (!periode) return <p className="text-muted">{t("common.loading")}</p>;

  const bulletins = periode.bulletins ?? [];
  const totalNet = bulletins.reduce((s, b) => s + Number(b.salaire_net), 0);
  const payes = bulletins.filter((b) => b.statut === "paye").length;

  const columns: Column<BulletinPaie>[] = [
    {
      key: "employe",
      header: t("comptabilite.paie.colEmploye"),
      cell: (b) => (
        <div>
          <button
            type="button"
            onClick={() => setDetail(b)}
            className="font-semibold text-primary hover:underline"
          >
            {b.employe.prenom} {b.employe.nom}
          </button>
          <span className="block text-[13px] text-muted">
            {b.employe.matricule}
          </span>
        </div>
      ),
    },
    {
      key: "brut",
      header: t("comptabilite.bulletin.brut"),
      cell: (b) => fcfa(b.salaire_brut),
    },
    {
      key: "cotis",
      header: t("comptabilite.bulletin.cotisations"),
      cell: (b) => fcfa(b.total_cotisations_salariales),
    },
    { key: "its", header: "ITS", cell: (b) => fcfa(b.its) },
    {
      key: "net",
      header: t("comptabilite.bulletin.net"),
      cell: (b) => (
        <span className="font-semibold text-heading">{fcfa(b.salaire_net)}</span>
      ),
    },
    {
      key: "statut",
      header: t("common.status"),
      cell: (b) =>
        b.statut === "paye" ? (
          <Badge tone="success" border>
            {t("comptabilite.paie.bulletinPaye")}
          </Badge>
        ) : (
          <Badge tone="warning" border>
            {t("comptabilite.paie.bulletinAPayer")}
          </Badge>
        ),
    },
    {
      key: "actions",
      header: "",
      className: "text-right",
      headClassName: "text-right",
      cell: (b) => (
        <div className="flex justify-end gap-1.5">
          <PdfButton
            path={`/bulletins-paie/${b.id}/pdf`}
            label="PDF"
            filename={`bulletin-${b.employe.matricule}.pdf`}
          />
          {b.statut === "a_payer" && periode.statut !== "brouillon" && (
            <Button
              size="sm"
              onClick={() => {
                setPayTarget(b);
                setMode("virement");
              }}
            >
              {t("comptabilite.paie.payer")}
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      <Link
        href="/comptabilite"
        className="inline-flex w-fit items-center gap-1 text-sm font-semibold text-heading hover:text-primary"
      >
        <IconChevronLeft size={16} />
        {t("comptabilite.title")}
      </Link>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="m-0 text-xl font-bold capitalize text-heading">
          {t("comptabilite.paie.titrePeriode")} — {formatMonth(periode.mois)}
        </h1>
        <div className="flex flex-wrap gap-2">
          {periode.statut === "brouillon" && (
            <>
              <Button
                variant="light"
                disabled={busy}
                onClick={() => runAction("recalculer")}
              >
                {t("comptabilite.paie.recalculer")}
              </Button>
              <Button disabled={busy} onClick={() => runAction("valider")}>
                {t("comptabilite.paie.valider")}
              </Button>
            </>
          )}
          {periode.statut === "validee" && (
            <Button
              disabled={busy || payes < bulletins.length}
              onClick={() => runAction("cloturer")}
            >
              {t("comptabilite.paie.cloturer")}
            </Button>
          )}
        </div>
      </div>

      {error && (
        <p className="rounded-[5px] bg-danger-light px-3 py-2 text-sm text-danger">
          {error}
        </p>
      )}

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <StatCard
          label={t("comptabilite.paie.colBulletins")}
          value={bulletins.length}
          tone="primary"
        />
        <StatCard
          label={t("comptabilite.paie.reglesSur", { total: bulletins.length })}
          value={payes}
          tone="success"
        />
        <StatCard
          label={t("comptabilite.paie.masseNette")}
          value={fcfa(totalNet)}
          tone="info"
        />
      </div>

      <DataTable
        columns={columns}
        rows={bulletins}
        getRowKey={(b) => b.id}
        emptyLabel={t("comptabilite.paie.aucunBulletin")}
      />

      <Modal
        open={payTarget !== null}
        onClose={() => setPayTarget(null)}
        title={t("comptabilite.paie.payer")}
        size="sm"
      >
        {payTarget && (
          <div className="flex flex-col gap-4">
            <p className="m-0 text-sm text-muted">
              {payTarget.employe.prenom} {payTarget.employe.nom} —{" "}
              <strong>{fcfa(payTarget.salaire_net)}</strong>
            </p>
            <Field label={t("comptabilite.paie.modePaiement")}>
              <Select value={mode} onChange={(e) => setMode(e.target.value)}>
                <option value="virement">{t("comptabilite.mode.virement")}</option>
                <option value="especes">{t("comptabilite.mode.especes")}</option>
                <option value="cheque">{t("comptabilite.mode.cheque")}</option>
                <option value="mobile_money">
                  {t("comptabilite.mode.mobileMoney")}
                </option>
              </Select>
            </Field>
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="light"
                onClick={() => setPayTarget(null)}
              >
                {t("common.cancel")}
              </Button>
              <Button disabled={busy} onClick={handlePay}>
                {t("comptabilite.paie.confirmerPaiement")}
              </Button>
            </div>
          </div>
        )}
      </Modal>

      <Modal
        open={detail !== null}
        onClose={() => setDetail(null)}
        title={t("comptabilite.bulletin.titre")}
        size="md"
      >
        {detail && (
          <Card className="p-0">
            <table className="w-full text-sm">
              <tbody>
                {(detail.lignes ?? []).map((l, i) => (
                  <tr key={i} className="border-b border-border">
                    <td className="px-3 py-1.5 text-heading">{l.libelle}</td>
                    <td className="px-3 py-1.5 text-right text-muted">
                      {l.base ? fcfa(l.base) : ""}
                    </td>
                    <td
                      className={`px-3 py-1.5 text-right ${
                        l.categorie === "gain"
                          ? "text-heading"
                          : "text-danger"
                      }`}
                    >
                      {l.categorie === "gain" ? "" : "- "}
                      {fcfa(l.montant)}
                    </td>
                  </tr>
                ))}
                <tr>
                  <td className="px-3 py-2 font-bold text-heading" colSpan={2}>
                    {t("comptabilite.bulletin.net")}
                  </td>
                  <td className="px-3 py-2 text-right font-bold text-heading">
                    {fcfa(detail.salaire_net)}
                  </td>
                </tr>
              </tbody>
            </table>
          </Card>
        )}
      </Modal>
    </div>
  );
}
