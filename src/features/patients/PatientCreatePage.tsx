"use client";

import Link from "next/link";
import { IconChevronLeft } from "@tabler/icons-react";
import { useTranslation } from "@/lib/i18n/LanguageContext";
import { PatientForm } from "./PatientForm";

export function PatientCreatePage() {
  const { t } = useTranslation();
  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-4">
      <Link
        href="/patients"
        className="inline-flex w-fit items-center gap-1 text-sm font-semibold text-heading hover:text-primary"
      >
        <IconChevronLeft size={16} />
        {t("patients.list.title")}
      </Link>
      <h1 className="m-0 text-lg font-bold text-heading">
        {t("patients.list.newPatient")}
      </h1>
      <PatientForm />
    </div>
  );
}
