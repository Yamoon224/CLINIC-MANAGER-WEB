import { Dashboard } from "@/features/administration/Dashboard";

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-lg font-semibold">Tableau de bord</h1>
      <Dashboard />
    </div>
  );
}
