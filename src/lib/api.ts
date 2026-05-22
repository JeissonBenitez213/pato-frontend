import { API_URL, GRAPHQL_URL } from "./env";
import {
  FEED_QUERY,
  SEARCH_POSTS_QUERY,
  FIND_ONE_USER_QUERY,
  FIND_FRIENDS_QUERY,
  GET_PET_QUERY,
  GET_BADGES_QUERY,
  CREATE_POST_MUTATION,
  ADD_REACTION_MUTATION,
  TOGGLE_FOLLOW_MUTATION,
  CREATE_COMMENT_MUTATION,
  POST_COMMENTS_QUERY,
} from "./queries";
import type { Badge, FullUser, Pet, Post, UserLite } from "./types";

/**
 * Cliente de red para el backend NestJS.
 *
 * El backend entrega el access_token y refresh_token como cookies
 * httpOnly. Por eso TODAS las peticiones usan `credentials: "include"`,
 * de modo que el navegador adjunta las cookies automaticamente y no
 * tenemos que manejar el JWT manualmente en el cliente.
 */

export class ApiError extends Error {
  status: number;
  body: unknown;
  constructor(message: string, status: number, body?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.body = body;
  }
}

/** Peticion REST generica contra el backend. */
async function rest<T = unknown>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(options.headers ?? {}),
    },
  });

  let data: unknown = null;
  const text = await res.text();
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }
  }

  if (!res.ok) {
    const message =
      (data as { message?: string })?.message ||
      `Error ${res.status} en ${path}`;
    throw new ApiError(message, res.status, data);
  }

  return data as T;
}

/** Intenta refrescar el access_token usando la cookie refresh_token. */
async function tryRefresh(): Promise<boolean> {
  try {
    await rest("/auth/refresh", { method: "POST", credentials: "include" });
    return true;
  } catch {
    return false;
  }
}

/**
 * Ejecuta una operacion GraphQL contra /graphql.
 * Si recibe UNAUTHENTICATED intenta refrescar y reintenta una vez.
 */
export async function gql<T = unknown>(
  query: string,
  variables: Record<string, unknown> = {},
  retry = true,
): Promise<T> {
  const res = await fetch(GRAPHQL_URL, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query, variables }),
  });

  const json = (await res.json()) as {
    data?: T;
    errors?: Array<{ message: string; extensions?: { code?: string } }>;
  };

  if (json.errors && json.errors.length) {
    const unauth = json.errors.some(
      (e) =>
        e.extensions?.code === "UNAUTHENTICATED" ||
        /unauthorized|unauthenticated/i.test(e.message),
    );

    if (unauth && retry) {
      const ok = await tryRefresh();
      if (ok) return gql<T>(query, variables, false);
    }

    throw new ApiError(
      json.errors.map((e) => e.message).join("; "),
      res.status,
      json.errors,
    );
  }

  return json.data as T;
}

export const api = {
  rest,
  gql,
  tryRefresh,

  me: async () => {
    const res = await fetch(process.env.NEXT_PUBLIC_GRAPHQL_URL, {
      method: "POST",

      credentials: "include",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        query: `
        query {
          getMyData {
            id_usuario
            nombre_usuario
          }
        }
      `,
      }),
    });

    const data = (await res.json()) as {
      authenticated: boolean;
      id?: number;
      nombre_usuario?: string;
      is_admin?: boolean;
    };

    if (!res.ok) {
      const message =
        (data as { message?: string })?.message ||
        `Error ${res.status} en /api/me`;
      throw new ApiError(message, res.status, data);
    }

    return data;
  },

  refresh: () => rest<{ ok: boolean }>("/auth/refresh", { method: "POST" }),

  registerAuth: (username: string, provider: string, provider_id: string) =>
    rest("/auth/registerAuth", {
      method: "POST",
      body: JSON.stringify({ username, provider, provider_id }),
    }),

  oAuthLogin: (provider: string, provider_id: string) =>
    rest<{ ok: boolean }>("/auth/oAuthLogin", {
      method: "POST",
      body: JSON.stringify({ provider, provider_id }),
    }),

  getFeed: () =>
    gql<{ posts: { data: Post[]; nextCursor: number | null } }>(FEED_QUERY),

  searchPosts: (filter: { search?: string; username?: string }) =>
    gql<{ searchPosts: Post[] }>(SEARCH_POSTS_QUERY, { filter }),

  findOneUser: (id_user: number) =>
    gql<{ findOneUser: FullUser }>(FIND_ONE_USER_QUERY, { id_user }),

  findFriends: () => gql<{ findFriends: UserLite[] }>(FIND_FRIENDS_QUERY),

  getPet: () => gql<{ getPet: Pet }>(GET_PET_QUERY),

  getBadges: () => gql<{ getBadges: Badge[] }>(GET_BADGES_QUERY),

  createPost: (input: {
    title: string;
    description?: string;
    files?: Array<{ dir: string; file_extension: string }>;
  }) => gql(CREATE_POST_MUTATION, { input }),

  addReaction: (input: {
    id_post: number;
    like?: boolean;
    favorites?: boolean;
    shares?: boolean;
  }) => gql(ADD_REACTION_MUTATION, { input }),

  toggleFollow: (id_user: number) =>
    gql<{
      toggleFollow: {
        following: boolean;
        user: { id_usuario: number; nombre_usuario: string };
      };
    }>(TOGGLE_FOLLOW_MUTATION, { id_user }),

  createComment: (input: { id_post: number; texto: string }) =>
    gql<{ createComment: { id_comentario: number } }>(CREATE_COMMENT_MUTATION, {
      input,
    }),

  getComments: (postId: number) =>
    gql<{ getComment: Array<{ id_comentario: number }> }>(POST_COMMENTS_QUERY, {
      postId,
    }),

  // ---- Auth (REST) ----
  login: (nombre_usuario: string, contrasena: string) =>
    rest<{ ok: boolean }>("/auth/login", {
      method: "POST",
      credentials: "include",
      body: JSON.stringify({ nombre_usuario, contraseña: contrasena }),
    }),

  register: (
    nombre_usuario: string,
    contrasena: string,
    contrasena_repetida: string,
  ) =>
    rest("/auth/register", {
      method: "POST",
      body: JSON.stringify({
        nombre_usuario,
        contraseña: contrasena,
        contraseña_repetida: contrasena_repetida,
      }),
    }),

  logout: () => rest<{ ok: boolean }>("/auth/logout", { method: "POST" }),

  // ---- Subida de archivos (REST multipart) ----
  async uploadFiles(files: File[]) {
    const form = new FormData();
    files.forEach((f) => form.append("files", f));
    const res = await fetch(`${API_URL}/files/upload`, {
      method: "POST",
      credentials: "include",
      body: form,
    });
    if (!res.ok) throw new ApiError("Error subiendo archivos", res.status);
    return (await res.json()) as Array<{
      path: string;
      extension: string;
      type: "image" | "video";
    }>;
  },
};

/** Construye la URL absoluta de un archivo servido por el backend. */
export function fileUrl(dir?: string | null): string | null {
  if (!dir) return null;
  if (dir.startsWith("http")) return dir;
  return `${API_URL}/${dir.replace(/^\/+/, "")}`;
}
