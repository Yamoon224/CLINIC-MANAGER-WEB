import { AdmissionForm } from "@/features/urgences/AdmissionForm";

export default function NewUrgencePage() {
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-lg font-semibold">Admission d&apos;urgence</h1>
      <AdmissionForm />
    </div>
  );
}
