import { Conges } from "@/features/personnel/Conges";
import { Employes } from "@/features/personnel/Employes";
import { Planning } from "@/features/personnel/Planning";

export default function PersonnelPage() {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-lg font-semibold mb-4">Employés</h1>
        <Employes />
      </div>

      <div>
        <h1 className="text-lg font-semibold mb-4">Congés</h1>
        <Conges />
      </div>

      <div>
        <h1 className="text-lg font-semibold mb-4">Planning / gardes</h1>
        <Planning />
      </div>
    </div>
  );
}
