import { ChaineFroid } from "@/features/vaccinations/ChaineFroid";
import { StockVaccins } from "@/features/vaccinations/StockVaccins";

export default function VaccinationsPage() {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-lg font-semibold mb-4">Stock de vaccins</h1>
        <StockVaccins />
      </div>

      <div>
        <h1 className="text-lg font-semibold mb-4">Chaîne du froid</h1>
        <ChaineFroid />
      </div>
    </div>
  );
}
