import { Creances } from "@/features/caisse/Creances";
import { Depenses } from "@/features/caisse/Depenses";
import { SessionCaisseWidget } from "@/features/caisse/SessionCaisseWidget";

export default function CaissePage() {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-lg font-semibold mb-4">Session de caisse</h1>
        <SessionCaisseWidget />
      </div>

      <div>
        <h1 className="text-lg font-semibold mb-4">Créances</h1>
        <Creances />
      </div>

      <div>
        <h1 className="text-lg font-semibold mb-4">Dépenses</h1>
        <Depenses />
      </div>
    </div>
  );
}
