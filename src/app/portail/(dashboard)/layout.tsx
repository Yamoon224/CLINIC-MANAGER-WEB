"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { usePortailAuth } from "@/features/portail/portail-auth-context";
import { useTranslation } from "@/lib/i18n/LanguageContext";
import { Button } from "@/components/ui";

const LINKS = [
  { href: "/portail/rendez-vous", labelKey: "portail.nav.rendezVous" },
  { href: "/portail/resultats", labelKey: "portail.nav.resultats" },
  { href: "/portail/factures", labelKey: "portail.nav.factures" },
] as const;

export default function PortailDashboardLayout({ children }: { children: React.ReactNode }) {
  const { patient, isLoading, logout } = usePortailAuth();
  const { t } = useTranslation();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading && !patient) router.replace("/portail");
  }, [isLoading, patient, router]);

  if (isLoading || !patient) return null;

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="border-b border-border bg-surface">
        <div className="mx-auto flex max-w-4xl flex-wrap items-center justify-between gap-4 px-6 py-4">
          <div>
            <p className="text-sm font-semibold">{t("portail.brand")}</p>
            <p className="text-xs text-muted">
              {patient.prenom} {patient.nom} · {patient.numero_dossier}
            </p>
          </div>
          <nav className="flex flex-wrap items-center gap-1">
            {LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  pathname.startsWith(link.href)
                    ? "bg-primary-light text-primary"
                    : "text-foreground hover:bg-primary-light/60"
                }`}
              >
                {t(link.labelKey)}
              </Link>
            ))}
            <Button variant="ghost" size="sm" onClick={() => logout()}>
              {t("portail.nav.logout")}
            </Button>
          </nav>
        </div>
      </header>
      <main className="mx-auto w-full max-w-4xl flex-1 px-6 py-8">{children}</main>
    </div>
  );
}
