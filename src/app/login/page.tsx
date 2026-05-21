"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/components/AuthContext";
import styles from "./auth.module.css";

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [usuario, setUsuario] = useState("");
  const [pass, setPass] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (usuario.length < 5) return setError("El usuario debe tener al menos 5 caracteres.");
    if (pass.length < 10) return setError("La contraseña debe tener al menos 10 caracteres.");
    setBusy(true);
    try {
      await login(usuario, pass);
      router.replace("/feed");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al iniciar sesión");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className={styles.screen}>
      <form className={styles.card} onSubmit={onSubmit}>
        <h1 className={styles.logo}>Pato</h1>
        <p className={styles.subtitle}>Inicia sesión para continuar</p>

        {error && <div className={styles.error}>{error}</div>}

        <div className={styles.field}>
          <label htmlFor="u">Usuario</label>
          <input
            id="u"
            value={usuario}
            onChange={(e) => setUsuario(e.target.value)}
            autoComplete="username"
            placeholder="tu_usuario"
          />
        </div>

        <div className={styles.field}>
          <label htmlFor="p">Contraseña</label>
          <input
            id="p"
            type="password"
            value={pass}
            onChange={(e) => setPass(e.target.value)}
            autoComplete="current-password"
            placeholder="••••••••••"
          />
        </div>

        <button className={styles.submit} disabled={busy}>
          {busy ? "Entrando…" : "Entrar"}
        </button>

        <p className={styles.alt}>
          ¿No tienes cuenta? <Link href="/register">Regístrate</Link>
        </p>
      </form>
    </div>
  );
}
