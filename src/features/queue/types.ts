export const SERVICES = [
  "consultations",
  "urgences",
  "laboratoire",
  "pharmacie",
  "vaccinations",
  "maternite",
  "hospitalisation",
] as const;

export type Service = (typeof SERVICES)[number];

export const SERVICE_LABELS: Record<Service, string> = {
  consultations: "Consultations",
  urgences: "Urgences",
  laboratoire: "Laboratoire",
  pharmacie: "Pharmacie",
  vaccinations: "Vaccinations",
  maternite: "Maternité",
  hospitalisation: "Hospitalisation",
};

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
