import { PageHeader } from "@/components/ui";
import { ProfilForm } from "@/features/auth/ProfilForm";

export default function ProfilPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Mon profil"
        description="Gérez vos informations personnelles."
      />
      <ProfilForm />
    </div>
  );
}
