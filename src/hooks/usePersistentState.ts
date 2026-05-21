"use client";

import { useCallback, useEffect, useState } from "react";

/**
 * Estado que persiste en localStorage.
 * Implementa la anotacion del wireframe:
 * "el estado del componente de la foto se mantiene ya sea expandida
 *  o comprimida segun si el usuario la abrio anteriormente o no".
 */
export function usePersistentState<T>(
  key: string,
  initial: T,
): [T, (v: T | ((prev: T) => T)) => void] {
  const [value, setValue] = useState<T>(initial);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(key);
      if (raw !== null) setValue(JSON.parse(raw) as T);
    } catch {
      /* ignore */
    }
    setLoaded(true);
  }, [key]);

  const update = useCallback(
    (v: T | ((prev: T) => T)) => {
      setValue((prev) => {
        const next =
          typeof v === "function" ? (v as (p: T) => T)(prev) : v;
        try {
          localStorage.setItem(key, JSON.stringify(next));
        } catch {
          /* ignore */
        }
        return next;
      });
    },
    [key],
  );

  // evita parpadeo: hasta que cargue usamos el inicial
  return [loaded ? value : initial, update];
}
