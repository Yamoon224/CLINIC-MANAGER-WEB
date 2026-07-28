import { WorkList } from "@/features/laboratoire/WorkList";

export default function LaboratoirePage() {
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-lg font-semibold">Laboratoire — liste de travail</h1>
      <WorkList />
    </div>
  );
}
