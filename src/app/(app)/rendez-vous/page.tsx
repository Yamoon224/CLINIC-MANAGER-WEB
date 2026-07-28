import { AgendaBoard } from "@/features/rendezvous/AgendaBoard";

export default function RendezVousPage() {
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-lg font-semibold">Rendez-vous</h1>
      <AgendaBoard />
    </div>
  );
}
