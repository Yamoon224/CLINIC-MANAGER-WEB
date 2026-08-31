"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { IconChevronRight, IconX } from "@tabler/icons-react";
import { cn } from "@/lib/cn";
import { useTranslation } from "@/lib/i18n/LanguageContext";
import { NAV_GROUPS, type NavItem } from "./nav-config";

function isActive(pathname: string | null, href: string): boolean {
  if (!pathname) return false;
  if (href === "/dashboard") return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

function itemActive(pathname: string | null, item: NavItem): boolean {
  if (isActive(pathname, item.href)) return true;
  return (item.children ?? []).some((c) => pathname === c.href);
}

export function Sidebar({
  open,
  onClose,
  collapsed = false,
}: {
  open: boolean;
  onClose: () => void;
  collapsed?: boolean;
}) {
  const pathname = usePathname();
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  // Ouvre automatiquement le sous-menu contenant la route active.
  useEffect(() => {
    const next: Record<string, boolean> = {};
    for (const group of NAV_GROUPS) {
      for (const item of group.items) {
        if (item.children && itemActive(pathname, item)) next[item.href] = true;
      }
    }
    setExpanded((prev) => ({ ...prev, ...next }));
  }, [pathname]);

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-20 bg-black/40 lg:hidden"
          onClick={onClose}
        />
      )}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-30 flex shrink-0 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground transition-[transform,width] lg:sticky lg:top-0 lg:h-screen lg:translate-x-0",
          collapsed ? "w-[70px]" : "w-[276px]",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-14 items-center justify-between gap-2 border-b border-sidebar-border px-4">
          <Link href="/dashboard" className="flex items-center gap-2 overflow-hidden">
            <Image
              src="/images/logo.png"
              alt="Clinic Manager"
              width={28}
              height={28}
              className="shrink-0 rounded-md bg-white p-0.5"
            />
            {!collapsed && (
              <span className="truncate font-semibold tracking-tight text-heading">
                Clinic Manager
              </span>
            )}
          </Link>
          <button
            onClick={onClose}
            className="text-sidebar-muted hover:text-primary lg:hidden"
            aria-label={t("nav.closeMenu")}
          >
            <IconX size={20} />
          </button>
        </div>

        <nav className="preclinic-scroll flex-1 overflow-y-auto px-3 py-4">
          {NAV_GROUPS.map((group) => (
            <div key={group.titleKey} className="mb-4">
              {!collapsed && (
                <p className="mb-2 px-2 text-[11px] font-semibold uppercase tracking-wider text-sidebar-title">
                  {t(group.titleKey)}
                </p>
              )}
              <ul className="flex flex-col gap-0.5">
                {group.items.map((item) => {
                  const active = itemActive(pathname, item);
                  const Icon = item.icon;
                  const hasChildren = Boolean(item.children?.length) && !collapsed;
                  const isOpen = expanded[item.href] ?? false;

                  return (
                    <li key={item.href}>
                      <div className="flex items-center">
                        <Link
                          href={item.href}
                          onClick={onClose}
                          title={collapsed ? t(item.labelKey) : undefined}
                          className={cn(
                            "flex flex-1 items-center gap-3 rounded-[6px] px-2.5 py-2 text-[13px] font-medium transition-colors",
                            collapsed && "justify-center",
                            active
                              ? "bg-sidebar-active text-primary"
                              : "text-sidebar-muted hover:bg-sidebar-hover hover:text-primary",
                          )}
                        >
                          <Icon size={18} className="shrink-0" />
                          {!collapsed && <span className="truncate">{t(item.labelKey)}</span>}
                        </Link>
                        {hasChildren && (
                          <button
                            type="button"
                            onClick={() =>
                              setExpanded((p) => ({ ...p, [item.href]: !isOpen }))
                            }
                            className="p-1.5 text-sidebar-muted hover:text-primary"
                            aria-label={t(item.labelKey)}
                          >
                            <IconChevronRight
                              size={14}
                              className={cn("transition-transform", isOpen && "rotate-90")}
                            />
                          </button>
                        )}
                      </div>
                      {hasChildren && isOpen && (
                        <ul className="mt-0.5 flex flex-col gap-0.5 border-l border-sidebar-border pl-3 ms-3">
                          {item.children!.map((child) => (
                            <li key={child.href}>
                              <Link
                                href={child.href}
                                onClick={onClose}
                                className={cn(
                                  "block rounded-[6px] px-2.5 py-1.5 text-[13px] transition-colors",
                                  pathname === child.href
                                    ? "text-primary"
                                    : "text-sidebar-muted hover:text-primary",
                                )}
                              >
                                {t(child.labelKey)}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>
      </aside>
    </>
  );
}
