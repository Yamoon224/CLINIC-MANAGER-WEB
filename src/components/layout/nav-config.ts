import {
  IconAmbulance,
  IconBed,
  IconCalendarCheck,
  IconHistory,
  IconLayoutDashboard,
  IconListNumbers,
  IconMicroscope,
  IconPill,
  IconSettings,
  IconShieldCheck,
  IconStethoscope,
  IconUserHeart,
  IconUsersGroup,
  IconVaccine,
  IconWallet,
} from "@tabler/icons-react";
import type { Icon } from "@tabler/icons-react";

export interface NavItem {
  href: string;
  labelKey: string;
  icon: Icon;
  children?: { href: string; labelKey: string }[];
}

export interface NavGroup {
  titleKey: string;
  items: NavItem[];
}

/* Structure groupée reproduisant les sections `menu-title` du template,
   avec les modules réels de l'application. */
export const NAV_GROUPS: NavGroup[] = [
  {
    titleKey: "nav.groups.main",
    items: [
      { href: "/dashboard", labelKey: "nav.dashboard", icon: IconLayoutDashboard },
    ],
  },
  {
    titleKey: "nav.groups.clinique",
    items: [
      {
        href: "/patients",
        labelKey: "nav.patients",
        icon: IconUserHeart,
        children: [
          { href: "/patients", labelKey: "nav.sub.patientsList" },
          { href: "/patients/nouveau", labelKey: "nav.sub.patientsNew" },
        ],
      },
      { href: "/rendez-vous", labelKey: "nav.rendezVous", icon: IconCalendarCheck },
      { href: "/queue", labelKey: "nav.queue", icon: IconListNumbers },
      { href: "/urgences", labelKey: "nav.urgences", icon: IconAmbulance },
      { href: "/vaccinations", labelKey: "nav.vaccinations", icon: IconVaccine },
    ],
  },
  {
    titleKey: "nav.groups.systemeClinique",
    items: [
      { href: "/laboratoire", labelKey: "nav.laboratoire", icon: IconMicroscope },
      { href: "/pharmacie", labelKey: "nav.pharmacie", icon: IconPill },
      { href: "/hospitalisation", labelKey: "nav.hospitalisation", icon: IconBed },
    ],
  },
  {
    titleKey: "nav.groups.finance",
    items: [
      { href: "/caisse", labelKey: "nav.caisse", icon: IconWallet },
      { href: "/assurances", labelKey: "nav.assurances", icon: IconShieldCheck },
    ],
  },
  {
    titleKey: "nav.groups.rh",
    items: [
      { href: "/personnel", labelKey: "nav.personnel", icon: IconUsersGroup },
    ],
  },
  {
    titleKey: "nav.groups.administration",
    items: [
      { href: "/audit", labelKey: "nav.audit", icon: IconHistory },
      { href: "/parametres", labelKey: "nav.parametres", icon: IconSettings },
    ],
  },
];

/* Icône utilisée par la recherche globale / raccourcis. */
export { IconStethoscope };
