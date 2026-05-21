import { createHmac, timingSafeEqual } from "crypto";
import { JWT_SECRET } from "./env";

/**
 * Verificacion minima de JWT HS256 sin dependencias externas.
 * Usa JWT_SECRET (variable de entorno solo-servidor) para validar
 * el access_token que el backend guarda en la cookie httpOnly.
 *
 * El backend firma payloads con la forma:
 *   { sub: number, username: string, isAdmin: boolean, iat, exp }
 */

function b64urlToBuf(str: string): Buffer {
  const pad = str.length % 4 === 0 ? "" : "=".repeat(4 - (str.length % 4));
  return Buffer.from(str.replace(/-/g, "+").replace(/_/g, "/") + pad, "base64");
}

export interface JwtPayload {
  sub: number;
  username: string;
  isAdmin: boolean;
  iat?: number;
  exp?: number;
}

export function verifyJwt(token: string): JwtPayload | null {
  if (!token || !JWT_SECRET) return null;

  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const [header, payload, signature] = parts;

  // recomputar firma HS256
  const expected = createHmac("sha256", JWT_SECRET)
    .update(`${header}.${payload}`)
    .digest();
  const provided = b64urlToBuf(signature);

  if (
    expected.length !== provided.length ||
    !timingSafeEqual(expected, provided)
  ) {
    return null;
  }

  let decoded: JwtPayload;
  try {
    decoded = JSON.parse(b64urlToBuf(payload).toString("utf8"));
  } catch {
    return null;
  }

  // validar expiracion
  if (decoded.exp && Date.now() / 1000 > decoded.exp) return null;

  return decoded;
}
