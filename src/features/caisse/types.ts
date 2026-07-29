export type SourceType = "analyse" | "dispensation" | "sejour";

export interface Facturable {
  type: SourceType;
  id: number;
  designation: string;
  quantite: number;
  prix_unitaire: number;
}

export interface LigneFacture {
  id: number;
  designation: string;
  quantite: number;
  prix_unitaire: string;
  montant: string;
  source_type: SourceType | null;
}

export type ModePaiement = "especes" | "mobile_money" | "carte" | "virement" | "cheque";

export const MODE_PAIEMENT_LABELS: Record<ModePaiement, string> = {
  especes: "Espèces",
  mobile_money: "Mobile money",
  carte: "Carte",
  virement: "Virement",
  cheque: "Chèque",
};

export interface Encaissement {
  id: number;
  montant: string;
  mode_paiement: ModePaiement;
  reference: string | null;
  caissier: { id: number; name: string } | null;
  created_at: string | null;
}

export type FactureStatut = "ouverte" | "partiellement_payee" | "payee" | "annulee";

export interface Facture {
  id: number;
  statut: FactureStatut;
  montant_total: string;
  montant_part_assurance: string;
  montant_part_patient: string;
  montant_paye: string;
  solde: number;
  patient: {
    id: number;
    nom: string;
    prenom: string;
    numero_dossier: string;
  };
  assurance_patient?: {
    id: number;
    numero_adherent: string;
    taux_couverture: string;
    compagnie: string;
  };
  bordereau_assurance_id: number | null;
  lignes: LigneFacture[];
  encaissements: Encaissement[];
  created_at: string | null;
}

export interface SessionCaisse {
  id: number;
  statut: "ouverte" | "cloturee";
  montant_ouverture: string;
  montant_cloture: string | null;
  montant_theorique: string | null;
  ecart: string | null;
  opened_at: string | null;
  closed_at: string | null;
  caissier: { id: number; name: string } | null;
}

export interface Depense {
  id: number;
  categorie: string;
  montant: string;
  description: string | null;
  piece_justificative_reference: string | null;
  created_at: string | null;
}

export interface LigneInput {
  type: SourceType | "libre";
  id?: number;
  designation?: string;
  quantite?: number;
  prix_unitaire?: number;
}
