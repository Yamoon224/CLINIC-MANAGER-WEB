import { UrgenceQueue } from "@/features/urgences/UrgenceQueue";

export default function UrgencesPage() {
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-lg font-semibold">Urgences</h1>
      <UrgenceQueue />
    </div>
  );
}
