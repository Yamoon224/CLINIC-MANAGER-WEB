"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/features/auth/auth-context";
import { Button } from "@/components/ui";

const NAV_LINKS = [
  { href: "/dashboard", label: "Tableau de bord" },
  { href: "/patients", label: "Patients" },
  { href: "/rendez-vous", label: "Rendez-vous" },
  { href: "/queue", label: "File d'attente" },
  { href: "/urgences", label: "Urgences" },
  { href: "/vaccinations", label: "Vaccinations" },
  { href: "/laboratoire", label: "Laboratoire" },
  { href: "/pharmacie", label: "Pharmacie" },
  { href: "/hospitalisation", label: "Hospitalisation" },
  { href: "/caisse", label: "Caisse" },
  { href: "/assurances", label: "Assurances" },
  { href: "/personnel", label: "Personnel" },
  { href: "/audit", label: "Audit" },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading && !user) router.replace("/");
  }, [isLoading, user, router]);

  if (isLoading || !user) return null;

  return (
    <div className="flex-1 flex flex-col">
      <header className="sticky top-0 z-10 border-b border-border bg-surface/80 backdrop-blur">
        <div className="flex items-center justify-between px-6 py-3">
          <div className="flex items-center gap-3">
            <Image
              src="/images/logo.png"
              alt="Clinic Manager"
              width={32}
              height={32}
              className="rounded-md"
            />
            <span className="font-semibold tracking-tight">Clinic Manager</span>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <span className="hidden text-muted sm:inline">{user.name}</span>
            <Button variant="outline" size="sm" onClick={() => logout()}>
              Déconnexion
            </Button>
          </div>
        </div>
        <nav className="flex items-center gap-1 overflow-x-auto px-4 pb-2 text-sm">
          {NAV_LINKS.map((link) => {
            const active =
              pathname === link.href || pathname?.startsWith(`${link.href}/`);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`whitespace-nowrap rounded-full px-3 py-1.5 transition-colors ${
                  active
                    ? "bg-primary text-white"
                    : "text-muted hover:bg-primary-light hover:text-primary"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
      </header>
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}
