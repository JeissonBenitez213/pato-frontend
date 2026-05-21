import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { API_URL } from '@/lib/env';

/**
 * Proxy local para `/auth/me` del backend.
 * El navegador envía la cookie httpOnly a este route handler,
 * y el handler repasa esa cookie al backend para validar la sesión.
 */
export async function GET() {
  const cookieHeader = (await headers()).get('cookie') ?? '';

  const res = await fetch(`${API_URL}/auth/me`, {
    method: 'GET',
    headers: cookieHeader ? { cookie: cookieHeader } : undefined,
  });

  const data = (await res.json()) as
    | {
        authenticated: boolean;
        id?: number;
        nombre_usuario?: string;
        is_admin?: boolean;
      }
    | { statusCode?: number; message?: string };

  return NextResponse.json(data, { status: res.status });
}
