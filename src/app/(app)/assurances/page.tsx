import { Bordereaux } from "@/features/assurances/Bordereaux";
import { CompagniesAssurance } from "@/features/assurances/CompagniesAssurance";
import { PrisesEnCharge } from "@/features/assurances/PrisesEnCharge";

export default function AssurancesPage() {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-lg font-semibold mb-4">Compagnies d&apos;assurance</h1>
        <CompagniesAssurance />
      </div>

      <div>
        <h1 className="text-lg font-semibold mb-4">Prises en charge</h1>
        <PrisesEnCharge />
      </div>

      <div>
        <h1 className="text-lg font-semibold mb-4">Bordereaux de réclamation</h1>
        <Bordereaux />
      </div>
    </div>
  );
}
