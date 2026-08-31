/**
 * Le code d'un service. La liste est désormais dynamique (table `services`,
 * gérée depuis Paramètres → Services) : ce type reste une simple chaîne.
 */
export type Service = string;

/** Services de repli si l'API n'est pas encore joignable. */
export const FALLBACK_SERVICES: ServiceRef[] = [
  { code: "consultations", nom: "Consultations", couleur: null },
  { code: "urgences", nom: "Urgences", couleur: null },
  { code: "laboratoire", nom: "Laboratoire", couleur: null },
  { code: "pharmacie", nom: "Pharmacie", couleur: null },
  { code: "vaccinations", nom: "Vaccinations", couleur: null },
  { code: "maternite", nom: "Maternité", couleur: null },
  { code: "hospitalisation", nom: "Hospitalisation", couleur: null },
];

export interface ServiceRef {
  code: string;
  nom: string;
  couleur: string | null;
}

export type TicketStatus = "en_attente" | "appele" | "traite" | "annule";

export interface Ticket {
  id: number;
  label: string;
  service: Service;
  numero: number;
  statut: TicketStatus;
  appele_at: string | null;
  patient: {
    id: number;
    nom: string;
    prenom: string;
    numero_dossier: string;
  };
  created_at: string | null;
}
