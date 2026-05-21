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
      <div
        style={{
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          color: "var(--text-dim)",
        }}
      >
        <div className="fade-up">Cargando…</div>
      </div>
    );
  }

  if (requireAuth && !user) return null;

  return (
    <div className="app-shell" style={{ paddingLeft: 0 }}>
      <Navbar />
      <main className="container nav-offset">{children}</main>
      <style jsx global>{`
        @media (min-width: 1100px) {
          .nav-offset {
            margin-left: 160px;
          }
        }
      `}</style>
    </div>
  );
}
