"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();

  const [usuario, setUsuario] = useState("");
  const [pass, setPass] = useState("");

  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);

  // 🔐 SOLO CHECK INICIAL (sin lógica extra)
  useEffect(() => {
    let mounted = true;

    const checkSession = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`,
          {
            method: "POST",
            credentials: "include",
          },
        );

        const data = await res.json();

        if (!mounted) return;

        if (res.ok && data?.ok) {
          window.location.href = "/feed"; // <- evita router loops
          return;
        }
      } catch (err) {
        console.log("No session");
      } finally {
        if (mounted) setCheckingSession(false);
      }
    };

    checkSession();

    return () => {
      mounted = false;
    };
  }, []);

  // 🔑 LOGIN MANUAL (estable)
  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nombre_usuario: usuario,
          contraseña: pass,
        }),
      });

      const data = await res.json();

      if (res.ok && data?.ok) {
        window.location.href = "/feed"; // <- evita loop con router
        return;
      }

      setError(data?.message || "Error al iniciar sesión");
    } catch (err) {
      setError("Error conectando con el servidor");
    } finally {
      setBusy(false);
    }
  }

  // ⏳ LOADING SOLO CHECK DE SESIÓN
  if (checkingSession) {
    return (
      <div className="min-h-screen grid place-items-center">
        Verificando sesión...
      </div>
    );
  }

  // 🔥 FORM SOLO SI NO HAY SESIÓN
  return (
    <div className="min-h-screen grid place-items-center p-6">
      <form
        className="w-[60vw] xl:w-[25vw] rounded-[var(--radius)] p-[34px_28px] bg-linear-to-br from-[var(--surface-grad-a)] to-[var(--surface-grad-b)] border-2 border-[var(--accent)] shadow-[0_0_30px_var(--accent-glow),inset_0_0_40px_rgba(0,0,0,0.4)] animate-popIn"
        onSubmit={onSubmit}
      >
        <h1 className="text-4xl font-black -tracking-[0.04em] m-0 mb-1 bg-linear-to-r from-[var(--accent)] to-[var(--accent-2)] bg-clip-text text-transparent">
          Pato
        </h1>

        <p className="m-0 mb-6.5 text-[var(--text-dim)] text-sm">
          Inicia sesión para continuar
        </p>

        {error && (
          <div className="bg-[rgba(255,90,120,0.12)] border border-[rgba(255,90,120,0.4)] text-[#ff9bb0] px-3.5 py-2.5 rounded-[var(--radius-sm)] text-xs mb-4">
            {error}
          </div>
        )}

        {/* USER */}
        <div className="mb-4">
          <label className="block text-xs uppercase mb-2">Usuario</label>
          <input
            className="w-full p-3 rounded bg-black/30"
            value={usuario}
            onChange={(e) => setUsuario(e.target.value)}
          />
        </div>

        {/* PASSWORD */}
        <div className="mb-4">
          <label className="block text-xs uppercase mb-2">Contraseña</label>
          <input
            type="password"
            className="w-full p-3 rounded bg-black/30"
            value={pass}
            onChange={(e) => setPass(e.target.value)}
          />
        </div>

        {/* BUTTON */}
        <button
          className="w-full py-3 rounded bg-[var(--accent)] text-white font-bold disabled:opacity-60"
          disabled={busy}
        >
          {busy ? "Entrando..." : "Entrar"}
        </button>

        <p className="mt-5 text-center text-sm text-[var(--text-dim)]">
          ¿No tienes cuenta?{" "}
          <Link href="/register" className="text-[var(--accent-2)]">
            Regístrate
          </Link>
        </p>
      </form>
    </div>
  );
}
