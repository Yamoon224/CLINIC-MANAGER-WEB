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
  label: string;
  icon: LucideIcon;
}

export const NAV_LINKS: NavLink[] = [
  { href: "/dashboard", label: "Tableau de bord", icon: LayoutDashboard },
  { href: "/patients", label: "Patients", icon: Users },
  { href: "/rendez-vous", label: "Rendez-vous", icon: CalendarDays },
  { href: "/queue", label: "File d'attente", icon: ListOrdered },
  { href: "/urgences", label: "Urgences", icon: Siren },
  { href: "/vaccinations", label: "Vaccinations", icon: Syringe },
  { href: "/laboratoire", label: "Laboratoire", icon: FlaskConical },
  { href: "/pharmacie", label: "Pharmacie", icon: Pill },
  { href: "/hospitalisation", label: "Hospitalisation", icon: BedDouble },
  { href: "/caisse", label: "Caisse", icon: Wallet },
  { href: "/assurances", label: "Assurances", icon: ShieldCheck },
  { href: "/personnel", label: "Personnel", icon: UserCog },
  { href: "/audit", label: "Audit", icon: FileClock },
];
