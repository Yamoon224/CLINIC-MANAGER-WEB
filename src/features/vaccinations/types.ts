export interface Vaccin {
  id: number;
  nom: string;
  antigene: string | null;
  nombre_doses: number;
  intervalle_jours: number | null;
  age_recommande_jours: number | null;
}

export interface LotVaccin {
  id: number;
  numero_lot: string;
  date_peremption: string | null;
  quantite_initiale: number;
  quantite_restante: number;
  est_perime: boolean;
}

export interface Vaccination {
  id: number;
  dose_numero: number;
  date_administration: string | null;
  site_injection: string | null;
  mapi_survenue: boolean;
  mapi_details: string | null;
  vaccin: { id: number; nom: string; nombre_doses: number };
  lot: { id: number; numero_lot: string } | null;
  agent_vaccinateur: { id: number; name: string } | null;
}

export interface Echeance {
  vaccin: Vaccin;
  prochaine_dose: number;
  date_prevue: string | null;
}

export interface Carnet {
  data: Vaccination[];
  echeances: Echeance[];
}

export interface ReleveTemperature {
  id: number;
  releve_at: string | null;
  temperature: string;
  anomalie: boolean;
  notes: string | null;
}

export interface AdministrerVaccinPayload {
  vaccin_id: number;
  lot_vaccin_id?: number;
  date_administration: string;
  site_injection?: string;
  mapi_survenue?: boolean;
  mapi_details?: string;
}

export interface CreerLotPayload {
  numero_lot: string;
  date_peremption: string;
  quantite_initiale: number;
}

export interface EnregistrerTemperaturePayload {
  releve_at: string;
  temperature: number;
  notes?: string;
}
