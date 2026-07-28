import { LoginForm } from "@/features/auth/LoginForm";

export default function LoginPage() {
  return (
    <main className="flex-1 flex items-center justify-center p-6">
      <div className="w-full max-w-sm flex flex-col gap-6">
        <h1 className="text-xl font-semibold text-center">
          Clinic Manager — Connexion
        </h1>
        <LoginForm />
      </div>
    </main>
  );
}
