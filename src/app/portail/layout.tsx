import type { Metadata } from "next";
import { PortailAuthProvider } from "@/features/portail/portail-auth-context";

export const metadata: Metadata = {
  title: "Espace patient — Clinic Manager",
};

export default function PortailRootLayout({ children }: { children: React.ReactNode }) {
  return <PortailAuthProvider>{children}</PortailAuthProvider>;
}
