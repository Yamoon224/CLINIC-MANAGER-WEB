export interface Medicament {
  id: number;
  dci: string;
  nom_commercial: string | null;
  forme: string | null;
  dosage: string | null;
  emplacement: string | null;
  prix_achat: string | null;
  prix_vente: string;
  seuil_alerte: number;
  stock_disponible: number;
}

export interface LotMedicament {
  id: number;
  numero_lot: string;
  date_peremption: string | null;
  quantite_initiale: number;
  quantite_restante: number;
  est_perime: boolean;
}

export interface Dispensation {
  id: number;
  quantite: number;
  prix_unitaire: string;
  montant_total: number;
  urgente: boolean;
  est_substitution: boolean;
  patient: {
    id: number;
    nom: string;
    prenom: string;
    numero_dossier: string;
  } | null;
  medicament: { id: number; dci: string; nom_commercial: string | null };
  medicament_original: { id: number; dci: string } | null;
  lot: { id: number; numero_lot: string };
  dispensateur: { id: number; name: string } | null;
  created_at: string | null;
}

export interface PeremptionProche {
  id: number;
  numero_lot: string;
  date_peremption: string | null;
  quantite_restante: number;
  medicament: { id: number; dci: string };
}

export interface Alertes {
  ruptures: Medicament[];
  peremptions_proches: PeremptionProche[];
}

export interface CreerLotPayload {
  numero_lot: string;
  date_peremption: string;
  quantite_initiale: number;
}

export interface DispenserPayload {
  medicament_id: number;
  lot_medicament_id: number;
  quantite: number;
  patient_id?: number;
  medicament_original_id?: number;
  urgente?: boolean;
}
