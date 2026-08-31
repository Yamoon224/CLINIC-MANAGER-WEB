"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { fetchPatientByCarte } from "@/features/dossier-medical/dossier-api";
import { ApiError } from "@/lib/api-client";
import { useTranslation } from "@/lib/i18n/LanguageContext";

/**
 * Cible du QR code de la carte patient. Segment réel (hors groupe `(app)`),
 * donc non soumis au garde d'authentification du shell : on gère nous-mêmes
 * la redirection vers le login en conservant la destination.
 */
export default function CarteResolverPage({
  params,
}: {
  params: Promise<{ uuid: string }>;
}) {
  const { uuid } = use(params);
  const router = useRouter();
  const { t } = useTranslation();
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const target = `/carte/${uuid}`;
    const token =
      typeof window !== "undefined"
        ? window.localStorage.getItem("auth_token")
        : null;

    if (!token) {
      router.replace(`/?redirect=${encodeURIComponent(target)}`);
      return;
    }

    fetchPatientByCarte(uuid)
      .then((res) => router.replace(`/patients/${res.data.id}/dossier`))
      .catch((error: unknown) => {
        if (error instanceof ApiError && error.status === 401) {
          window.localStorage.removeItem("auth_token");
          router.replace(`/?redirect=${encodeURIComponent(target)}`);
          return;
        }
        setNotFound(true);
      });
  }, [uuid, router]);

  if (notFound) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-3 p-6 text-center">
        <h1 className="m-0 text-lg font-semibold text-heading">
          {t("dossierMedical.carteInconnueTitre")}
        </h1>
        <p className="m-0 text-sm text-muted">
          {t("dossierMedical.carteInconnueTexte")}
        </p>
        <Link
          href="/patients"
          className="text-sm font-semibold text-primary hover:underline"
        >
          {t("patients.title")}
        </Link>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <p className="text-sm text-muted">{t("dossierMedical.ouvertureDossier")}</p>
    </main>
  );
}
