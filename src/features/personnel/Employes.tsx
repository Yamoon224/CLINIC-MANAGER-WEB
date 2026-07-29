"use client";

import { useEffect, useState } from "react";
import { createEmploye, fetchEmployes } from "./personnel-api";
import { TYPE_CONTRAT_LABELS, type Employe, type TypeContrat } from "./types";
import { Badge, Button, Card, Field, Input, Select } from "@/components/ui";

export function Employes() {
  const [employes, setEmployes] = useState<Employe[]>([]);
  const [nom, setNom] = useState("");
  const [prenom, setPrenom] = useState("");
  const [fonction, setFonction] = useState("");
  const [service, setService] = useState("");
  const [typeContrat, setTypeContrat] = useState<TypeContrat>("cdi");
  const [dateEmbauche, setDateEmbauche] = useState("");
  const [busy, setBusy] = useState(false);

  function load() {
    fetchEmployes().then((res) => setEmployes(res.data));
  }

  useEffect(() => {
    load();
  }, []);

  async function handleSubmit() {
    if (!nom || !prenom || !fonction || !dateEmbauche) return;
    setBusy(true);
    try {
      await createEmploye({
        nom,
        prenom,
        fonction,
        service: service || undefined,
        type_contrat: typeContrat,
        date_embauche: dateEmbauche,
      });
      setNom("");
      setPrenom("");
      setFonction("");
      setService("");
      setDateEmbauche("");
      load();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col gap-4 max-w-2xl">
      <Card className="flex flex-col gap-3">
        <div className="grid grid-cols-2 gap-3">
          <Field label="Nom">
            <Input placeholder="Nom" value={nom} onChange={(e) => setNom(e.target.value)} />
          </Field>
          <Field label="Prénom">
            <Input
              placeholder="Prénom"
              value={prenom}
              onChange={(e) => setPrenom(e.target.value)}
            />
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Fonction">
            <Input
              placeholder="Fonction"
              value={fonction}
              onChange={(e) => setFonction(e.target.value)}
            />
          </Field>
          <Field label="Service">
            <Input
              placeholder="Service"
              value={service}
              onChange={(e) => setService(e.target.value)}
            />
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Type de contrat">
            <Select
              value={typeContrat}
              onChange={(e) => setTypeContrat(e.target.value as TypeContrat)}
            >
              {Object.entries(TYPE_CONTRAT_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Date d'embauche">
            <Input
              type="date"
              value={dateEmbauche}
              onChange={(e) => setDateEmbauche(e.target.value)}
            />
          </Field>
        </div>
        <Button onClick={handleSubmit} disabled={busy} className="self-start">
          Ajouter l&apos;employé
        </Button>
      </Card>

      <div className="flex flex-col gap-2">
        {employes.map((e) => (
          <Card key={e.id} className="flex items-center justify-between p-3">
            <span className="text-sm">
              {e.prenom} {e.nom} - {e.fonction}
              {e.service && ` (${e.service})`}
            </span>
            <span className="flex items-center gap-2 text-xs text-muted">
              {e.matricule}
              <Badge tone="neutral">{TYPE_CONTRAT_LABELS[e.type_contrat]}</Badge>
            </span>
          </Card>
        ))}
        {employes.length === 0 && <p className="text-sm text-muted">Aucun employé.</p>}
      </div>
    </div>
  );
}
