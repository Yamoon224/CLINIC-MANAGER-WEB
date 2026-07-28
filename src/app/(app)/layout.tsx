"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/features/auth/auth-context";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) router.replace("/login");
  }, [isLoading, user, router]);

  if (isLoading || !user) return null;

  return (
    <div className="flex-1 flex flex-col">
      <header className="border-b px-6 py-3 flex items-center justify-between">
        <span className="font-semibold">Clinic Manager</span>
        <div className="flex items-center gap-4 text-sm">
          <span>{user.name}</span>
          <button onClick={() => logout()} className="underline">
            Déconnexion
          </button>
        </div>
      </header>
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}
