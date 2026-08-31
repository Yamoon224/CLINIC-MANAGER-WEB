export interface Patient {
  id: number;
  numero_dossier: string;
  carte_uuid: string | null;
  nom: string;
  prenom: string;
  date_naissance: string | null;
  sexe: "M" | "F" | null;
  telephone: string | null;
  adresse: string | null;
  personne_a_prevenir_nom: string | null;
  personne_a_prevenir_telephone: string | null;
  piece_identite_type: string | null;
  piece_identite_numero: string | null;
  assurance_nom: string | null;
  assurance_numero: string | null;
  allergies: string | null;
  antecedents: string | null;
  created_at: string | null;
  portail_email: string | null;
  portail_active_at: string | null;
}

export interface RegisterPatientPayload {
  nom: string;
  prenom: string;
  date_naissance?: string;
  sexe?: "M" | "F";
  telephone?: string;
  adresse?: string;
  personne_a_prevenir_nom?: string;
  personne_a_prevenir_telephone?: string;
  piece_identite_type?: string;
  piece_identite_numero?: string;
  assurance_nom?: string;
  assurance_numero?: string;
  allergies?: string;
  antecedents?: string;
}
