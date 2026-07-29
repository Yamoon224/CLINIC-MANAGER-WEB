import type { Facture } from "@/features/caisse/types";

export interface CompagnieAssurance {
  id: number;
  nom: string;
  contact_nom: string | null;
  contact_telephone: string | null;
  contact_email: string | null;
  adresse: string | null;
  taux_couverture_defaut: string;
  actif: boolean;
}

export type AssuranceStatut = "active" | "suspendue" | "expiree";

export interface AssurancePatient {
  id: number;
  numero_adherent: string;
  taux_couverture: string;
  date_debut: string;
  date_fin: string | null;
  statut: AssuranceStatut;
  active: boolean;
  compagnie: CompagnieAssurance;
  patient?: {
    id: number;
    nom: string;
    prenom: string;
    numero_dossier: string;
  };
}

export type PriseEnChargeStatut = "en_attente" | "approuvee" | "refusee";

export interface PriseEnCharge {
  id: number;
  numero: string;
  motif: string;
  montant_plafond: string | null;
  statut: PriseEnChargeStatut;
  date_demande: string;
  date_reponse: string | null;
  commentaire: string | null;
  assurance_patient: AssurancePatient;
}

export type BordereauStatut = "brouillon" | "envoye" | "paye_partiel" | "paye";

export interface BordereauAssurance {
  id: number;
  numero: string;
  statut: BordereauStatut;
  montant_total: string;
  montant_regle: string;
  date_envoi: string | null;
  date_reglement: string | null;
  compagnie: CompagnieAssurance;
  nombre_factures: number | null;
  factures?: Facture[];
  created_at: string | null;
}
