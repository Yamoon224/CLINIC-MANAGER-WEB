import { RendezVousForm } from "@/features/rendezvous/RendezVousForm";

export default function NewRendezVousPage() {
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-lg font-semibold">Nouveau rendez-vous</h1>
      <RendezVousForm />
    </div>
  );
}
