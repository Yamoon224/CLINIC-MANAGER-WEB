"use client";

import { PageHeader } from "@/components/ui";
import { ProfilForm } from "@/features/auth/ProfilForm";
import { useTranslation } from "@/lib/i18n/LanguageContext";

export default function ProfilPage() {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title={t("profil.title")} description={t("profil.subtitle")} />
      <ProfilForm />
    </div>
  );
}
