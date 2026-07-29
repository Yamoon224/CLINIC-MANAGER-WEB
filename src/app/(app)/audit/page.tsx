import { Audit } from "@/features/administration/Audit";

export default function AuditPage() {
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-lg font-semibold">Journal d&apos;audit</h1>
      <Audit />
    </div>
  );
}
