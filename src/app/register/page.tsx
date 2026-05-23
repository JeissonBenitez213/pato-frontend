"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/components/AuthContext";

export default function RegisterPage() {
  const { register } = useAuth();
  const router = useRouter();
  const [usuario, setUsuario] = useState("");
  const [pass, setPass] = useState("");
  const [pass2, setPass2] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (usuario.length < 5)
      return setError("El usuario debe tener al menos 5 caracteres.");
    if (pass.length < 10)
      return setError("La contraseña debe tener al menos 10 caracteres.");
    if (pass !== pass2) return setError("Las contraseñas no coinciden.");
    setBusy(true);
    try {
      await register(usuario, pass, pass2);
      router.replace("/feed");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al registrarse");
    } finally {
      setBusy(false);
    }
  }

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
          Crea tu cuenta
        </p>

        {error && (
          <div className="bg-[rgba(255,90,120,0.12)] border border-[rgba(255,90,120,0.4)] text-[#ff9bb0] px-3.5 py-2.5 rounded-[var(--radius-sm)] text-xs mb-4">
            {error}
          </div>
        )}

        <div className="mb-4">
          <label
            htmlFor="u"
            className="block text-xs tracking-widest uppercase text-[var(--text-dim)] mb-[7px]"
          >
            Usuario
          </label>
          <input
            id="u"
            value={usuario}
            onChange={(e) => setUsuario(e.target.value)}
            autoComplete="off"
            placeholder="mínimo 5 caracteres"
            className="w-full px-4 py-[13px] rounded-full bg-[rgba(12,5,10,0.6)] border-2 border-[rgba(124,92,255,0.35)] text-[var(--text)] text-base outline-none transition-all focus:border-[var(--accent)] focus:shadow-[0_0_14px_var(--accent-glow)]"
          />
        </div>

        <div className="mb-4">
          <label
            htmlFor="p"
            className="block text-xs tracking-widest uppercase text-[var(--text-dim)] mb-[7px]"
          >
            Contraseña
          </label>
          <input
            id="p"
            type="password"
            value={pass}
            onChange={(e) => setPass(e.target.value)}
            autoComplete="off"
            placeholder="mínimo 10 caracteres"
            className="w-full px-4 py-[13px] rounded-full bg-[rgba(12,5,10,0.6)] border-2 border-[rgba(124,92,255,0.35)] text-[var(--text)] text-base outline-none transition-all focus:border-[var(--accent)] focus:shadow-[0_0_14px_var(--accent-glow)]"
          />
        </div>

        <div className="mb-4">
          <label
            htmlFor="p2"
            className="block text-xs tracking-widest uppercase text-[var(--text-dim)] mb-[7px]"
          >
            Repetir contraseña
          </label>
          <input
            id="p2"
            type="password"
            value={pass2}
            onChange={(e) => setPass2(e.target.value)}
            autoComplete="off"
            placeholder="repite la contraseña"
            className="w-full px-4 py-[13px] rounded-full bg-[rgba(12,5,10,0.6)] border-2 border-[rgba(124,92,255,0.35)] text-[var(--text)] text-base outline-none transition-all focus:border-[var(--accent)] focus:shadow-[0_0_14px_var(--accent-glow)]"
          />
        </div>

        <button
          className="w-full mt-2 px-0 py-3.5 rounded-full border-none text-base font-bold tracking-wider text-white bg-linear-to-r from-[var(--accent)] to-[var(--accent-2)] shadow-[0_0_22px_var(--accent-glow)] transition-all hover:not-disabled:translate-y-[-2px] hover:not-disabled:shadow-[0_0_30px_var(--accent-glow)] disabled:opacity-60 disabled:cursor-not-allowed"
          disabled={busy}
        >
          {busy ? "Creando…" : "Crear cuenta"}
        </button>

        <p className="mt-5.5 text-center text-[var(--text-dim)] text-sm">
          ¿Ya tienes cuenta?{" "}
          <Link href="/login" className="text-[var(--accent-2)] font-semibold">
            Inicia sesión
          </Link>
        </p>
      </form>
    </div>
  );
}
