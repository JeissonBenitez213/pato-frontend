"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "./AuthContext";
import Navbar from "./Navbar";

/** Envuelve paginas protegidas: muestra navbar y redirige a /login si no hay sesion. */
export default function AppShell({
  children,
  requireAuth = true,
}: {
  children: React.ReactNode;
  requireAuth?: boolean;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (requireAuth && !loading && !user) {
      router.replace("/login");
    }
  }, [requireAuth, loading, user, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-start justify-center pt-12 text-[var(--text-dim)]">
        <div className="fade-up">Cargando…</div>
      </div>
    );
  }

  if (requireAuth && !user) return null;

  return (
    <div>
      <Navbar />
      <main className="container nav-offset">{children}</main>
    </div>
  );
}
