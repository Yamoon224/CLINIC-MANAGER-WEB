"use client";

import Image from "next/image";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/features/auth/auth-context";
import { LoginForm } from "@/features/auth/LoginForm";
import { useTranslation } from "@/lib/i18n/LanguageContext";

export default function RootPage() {
  const { user, isLoading } = useAuth();
  const { t } = useTranslation();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && user) router.replace("/dashboard");
  }, [isLoading, user, router]);

  if (isLoading || user) return null;

  return (
    <main className="flex min-h-screen flex-1">
      <div className="relative hidden w-2/3 lg:block">
        <Image
          src="/images/nurse-login.jpg"
          alt="Personnel soignant de la clinique"
          fill
          priority
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-primary/80 via-primary/20 to-transparent" />
        <div className="absolute bottom-10 left-10 right-10 text-white">
          <h2 className="text-2xl font-semibold tracking-tight">
            Clinic Manager
          </h2>
          <p className="mt-2 max-w-md text-sm text-white/85">
            {t("auth.tagline")}
          </p>
        </div>
      </div>

      <div className="flex w-full flex-col items-center justify-center gap-8 bg-background px-6 py-12 lg:w-1/3">
        <div className="flex w-full max-w-sm flex-col gap-8">
          <div className="flex flex-col items-center gap-3 text-center">
            <Image
              src="/images/logo.png"
              alt="Clinic Manager"
              width={56}
              height={56}
              className="rounded-xl"
            />
            <div>
              <h1 className="text-xl font-semibold tracking-tight">
                {t("auth.welcomeBack")}
              </h1>
              <p className="mt-1 text-sm text-muted">
                {t("auth.loginSubtitle")}
              </p>
            </div>
          </div>
          <LoginForm />
        </div>
      </div>
    </main>
  );
}
