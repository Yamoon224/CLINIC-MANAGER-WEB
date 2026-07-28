import { AlertesStock } from "@/features/pharmacie/AlertesStock";
import { StockMedicaments } from "@/features/pharmacie/StockMedicaments";

export default function PharmaciePage() {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-lg font-semibold mb-4">Stock de médicaments</h1>
        <StockMedicaments />
      </div>

      <div>
        <h1 className="text-lg font-semibold mb-4">Alertes</h1>
        <AlertesStock />
      </div>
    </div>
  );
}
