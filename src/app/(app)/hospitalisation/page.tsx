import { BedPlan } from "@/features/hospitalisation/BedPlan";

export default function HospitalisationPage() {
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-lg font-semibold">Plan des lits</h1>
      <BedPlan />
    </div>
  );
}
