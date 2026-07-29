import {
  BedDouble,
  CalendarDays,
  FileClock,
  FlaskConical,
  LayoutDashboard,
  ListOrdered,
  Pill,
  ShieldCheck,
  Siren,
  Syringe,
  UserCog,
  Users,
  Wallet,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface NavLink {
  href: string;
  labelKey: string;
  icon: LucideIcon;
}

export const NAV_LINKS: NavLink[] = [
  { href: "/dashboard", labelKey: "nav.dashboard", icon: LayoutDashboard },
  { href: "/patients", labelKey: "nav.patients", icon: Users },
  { href: "/rendez-vous", labelKey: "nav.rendezVous", icon: CalendarDays },
  { href: "/queue", labelKey: "nav.queue", icon: ListOrdered },
  { href: "/urgences", labelKey: "nav.urgences", icon: Siren },
  { href: "/vaccinations", labelKey: "nav.vaccinations", icon: Syringe },
  { href: "/laboratoire", labelKey: "nav.laboratoire", icon: FlaskConical },
  { href: "/pharmacie", labelKey: "nav.pharmacie", icon: Pill },
  { href: "/hospitalisation", labelKey: "nav.hospitalisation", icon: BedDouble },
  { href: "/caisse", labelKey: "nav.caisse", icon: Wallet },
  { href: "/assurances", labelKey: "nav.assurances", icon: ShieldCheck },
  { href: "/personnel", labelKey: "nav.personnel", icon: UserCog },
  { href: "/audit", labelKey: "nav.audit", icon: FileClock },
];
