import type { FactureStatut, ModePaiement } from "@/features/caisse/types";

/* Rubriques de la grille tarifaire, dans l'ordre de la grille papier. */
export const CATEGORIES_ACTE = [
  "consultation",
  "chirurgie_dentaire",
  "hygiene_dentaire",
  "parodontologie",
  "prothese_dentaire",
  "chirurgie_orale",
  "soins_conservateurs",
  "orthodontie",
] as const;

export type CategorieActe = (typeof CATEGORIES_ACTE)[number];

export interface ActeDentaire {
  id: number;
  categorie: CategorieActe;
  libelle: string;
  prix: string;
  unite: string | null;
  ordre: number;
  actif: boolean;
}

export interface ActeDentairePayload {
  categorie: CategorieActe;
  libelle: string;
  prix: number;
  unite?: string | null;
  ordre?: number;
  actif?: boolean;
}

export interface PatientRef {
  id: number;
  nom: string;
  prenom: string;
  numero_dossier: string;
}

export interface Dentiste {
  id: number;
  name: string;
}

/* État de règlement d'un document dentaire (sa facture, encaissée à la Caisse). */
export interface FactureDentaire {
  id: number;
  statut: FactureStatut;
  montant_total: string;
  montant_part_patient: string;
  montant_paye: string;
  solde: number;
}

export interface ConsultationDentaire {
  id: number;
  date_consultation: string;
  motif: string;
  examen: string | null;
  diagnostic: string | null;
  plan_traitement: string | null;
  poids: string | null;
  montant: string;
  patient: PatientRef;
  praticien: Dentiste;
  facture: FactureDentaire | null;
  created_at: string | null;
}

export interface ConsultationDentairePayload {
  patient_id: number;
  praticien_id?: number | null;
  date_consultation?: string | null;
  motif: string;
  examen?: string | null;
  diagnostic?: string | null;
  plan_traitement?: string | null;
  poids?: number | null;
  montant: number;
}

export type ConsultationDentaireUpdate = Pick<
  ConsultationDentairePayload,
  "motif" | "examen" | "diagnostic" | "plan_traitement" | "poids"
>;

export type TraitementStatut = "en_cours" | "termine" | "annule";

export interface TraitementActe {
  id: number;
  acte_dentaire_id: number | null;
  designation: string;
  dent: string | null;
  quantite: number;
  prix_unitaire: string;
  montant: string;
}

export interface Versement {
  id: number;
  montant: string;
  mode_paiement: ModePaiement;
  reference: string | null;
  reste_a_payer: number;
  caissier: { id: number; name: string } | null;
  created_at: string | null;
}

export interface TraitementDentaire {
  id: number;
  date_debut: string;
  date_fin: string | null;
  statut: TraitementStatut;
  poids: string | null;
  notes: string | null;
  montant_total: string;
  consultation_dentaire_id: number | null;
  patient: PatientRef;
  praticien: Dentiste;
  actes: TraitementActe[];
  facture: FactureDentaire | null;
  /** Présent sur le détail d'un traitement uniquement. */
  versements?: Versement[];
  created_at: string | null;
}

export interface TraitementActeInput {
  acte_dentaire_id?: number | null;
  designation?: string | null;
  dent?: string | null;
  quantite?: number;
  prix_unitaire?: number | null;
}

export interface TraitementDentairePayload {
  patient_id: number;
  praticien_id?: number | null;
  date_debut?: string | null;
  poids?: number | null;
  notes?: string | null;
  actes: TraitementActeInput[];
}

export interface LigneOrdonnance {
  medicament: string;
  posologie?: string | null;
  duree?: string | null;
}

export interface OrdonnanceDentaire {
  id: number;
  date_ordonnance: string;
  poids: string | null;
  lignes: LigneOrdonnance[];
  notes: string | null;
  consultation_dentaire_id: number | null;
  patient: PatientRef;
  praticien: Dentiste;
  created_at: string | null;
}

export interface OrdonnanceDentairePayload {
  patient_id: number;
  praticien_id?: number | null;
  date_ordonnance?: string | null;
  poids?: number | null;
  lignes: LigneOrdonnance[];
  notes?: string | null;
}
