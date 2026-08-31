"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  IconCalendarClock,
  IconFlask,
  IconLogout,
  IconWallet,
} from "@tabler/icons-react";
import { usePortailAuth } from "@/features/portail/portail-auth-context";
import { useTranslation } from "@/lib/i18n/LanguageContext";
import { cn } from "@/lib/cn";

const LINKS = [
  {
    href: "/portail/rendez-vous",
    labelKey: "portail.nav.rendezVous",
    icon: IconCalendarClock,
  },
  {
    href: "/portail/resultats",
    labelKey: "portail.nav.resultats",
    icon: IconFlask,
  },
  {
    href: "/portail/factures",
    labelKey: "portail.nav.factures",
    icon: IconWallet,
  },
] as const;

export default function PortailDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { patient, isLoading, logout } = usePortailAuth();
  const { t } = useTranslation();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading && !patient) router.replace("/portail");
  }, [isLoading, patient, router]);

  if (isLoading || !patient) return null;

  const initial = patient.prenom.charAt(0).toUpperCase();

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="border-b border-border bg-surface">
        <div className="mx-auto flex max-w-4xl flex-wrap items-center justify-between gap-4 px-6 py-3">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold text-white">
              {initial}
            </span>
            <div>
              <p className="m-0 text-sm font-semibold text-heading">
                {t("portail.brand")}
              </p>
              <p className="m-0 text-xs text-muted">
                {patient.prenom} {patient.nom} · {patient.numero_dossier}
              </p>
            </div>
          </div>
          <nav className="flex flex-wrap items-center gap-1">
            {LINKS.map((link) => {
              const Icon = link.icon;
              const active = pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "flex items-center gap-1.5 rounded-[6px] px-3 py-2 text-sm font-medium transition-colors",
                    active
                      ? "bg-primary-light text-primary"
                      : "text-muted hover:bg-light hover:text-primary",
                  )}
                >
                  <Icon size={16} />
                  {t(link.labelKey)}
                </Link>
              );
            })}
            <button
              type="button"
              onClick={() => logout()}
              className="flex items-center gap-1.5 rounded-[6px] px-3 py-2 text-sm font-medium text-danger hover:bg-danger-light"
            >
              <IconLogout size={16} />
              {t("portail.nav.logout")}
            </button>
          </nav>
        </div>
      </header>
      <main className="mx-auto w-full max-w-4xl flex-1 px-6 py-8">{children}</main>
    </div>
  );
}
