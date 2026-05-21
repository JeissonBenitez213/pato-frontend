"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/components/AuthContext";
import styles from "../login/auth.module.css";

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
    if (usuario.length < 5) return setError("El usuario debe tener al menos 5 caracteres.");
    if (pass.length < 10) return setError("La contraseña debe tener al menos 10 caracteres.");
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
    <div className={styles.screen}>
      <form className={styles.card} onSubmit={onSubmit}>
        <h1 className={styles.logo}>Pato</h1>
        <p className={styles.subtitle}>Crea tu cuenta</p>

        {error && <div className={styles.error}>{error}</div>}

        <div className={styles.field}>
          <label htmlFor="u">Usuario</label>
          <input
            id="u"
            value={usuario}
            onChange={(e) => setUsuario(e.target.value)}
            placeholder="mínimo 5 caracteres"
          />
        </div>

        <div className={styles.field}>
          <label htmlFor="p">Contraseña</label>
          <input
            id="p"
            type="password"
            value={pass}
            onChange={(e) => setPass(e.target.value)}
            placeholder="mínimo 10 caracteres"
          />
        </div>

        <div className={styles.field}>
          <label htmlFor="p2">Repetir contraseña</label>
          <input
            id="p2"
            type="password"
            value={pass2}
            onChange={(e) => setPass2(e.target.value)}
            placeholder="repite la contraseña"
          />
        </div>

        <button className={styles.submit} disabled={busy}>
          {busy ? "Creando…" : "Crear cuenta"}
        </button>

        <p className={styles.alt}>
          ¿Ya tienes cuenta? <Link href="/login">Inicia sesión</Link>
        </p>
      </form>
    </div>
  );
}
