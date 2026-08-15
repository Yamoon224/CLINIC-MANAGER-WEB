"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { usePortailAuth } from "@/features/portail/portail-auth-context";
import { PortailLoginForm } from "@/features/portail/PortailLoginForm";
import { useTranslation } from "@/lib/i18n/LanguageContext";

export default function PortailLoginPage() {
  const { patient, isLoading } = usePortailAuth();
  const { t } = useTranslation();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && patient) router.replace("/portail/rendez-vous");
  }, [isLoading, patient, router]);

  if (isLoading || patient) return null;

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-6 py-12">
      <div className="flex w-full max-w-sm flex-col gap-8">
        <div className="flex flex-col items-center gap-2 text-center">
          <h1 className="text-xl font-semibold tracking-tight">
            {t("portail.brand")}
          </h1>
          <p className="text-sm text-muted">{t("portail.tagline")}</p>
        </div>
        <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
          <h2 className="mb-1 text-lg font-semibold">{t("portail.login.title")}</h2>
          <p className="mb-5 text-sm text-muted">{t("portail.login.subtitle")}</p>
          <PortailLoginForm />
        </div>
      </div>
    </main>
  );
}
