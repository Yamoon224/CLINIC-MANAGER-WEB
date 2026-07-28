import Link from "next/link";
import { UrgenceQueue } from "@/features/urgences/UrgenceQueue";

export default function UrgencesPage() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold">Urgences</h1>
        <Link
          href="/urgences/new"
          className="bg-red-600 text-white rounded px-3 py-2"
        >
          + Admission d&apos;urgence
        </Link>
      </div>
      <UrgenceQueue />
    </div>
  );
}
