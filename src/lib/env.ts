/**
 * Acceso centralizado a las variables de entorno.
 * Las NEXT_PUBLIC_* estan disponibles en el navegador.
 * JWT_SECRET / JWT_EXPIRES_IN solo existen del lado servidor.
 */

export const API_URL =
  process.env.NEXT_PUBLIC_API_URL ??
  process.env.BACKEND_URL ??
  "http://localhost:3000";

export const GRAPHQL_URL =
  process.env.NEXT_PUBLIC_GRAPHQL_URL ??
  (process.env.BACKEND_URL
    ? `${process.env.BACKEND_URL.replace(/\/+$/, "")}/graphql`
    : `${API_URL}/graphql`);

export const GRAPHQL_WS_URL =
  process.env.NEXT_PUBLIC_GRAPHQL_WS_URL ?? GRAPHQL_URL.replace(/^http/, "ws");

// Solo servidor (no se exponen al cliente porque no llevan NEXT_PUBLIC_)
export const JWT_SECRET = process.env.JWT_SECRET ?? "";
export const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN ?? "15m";
