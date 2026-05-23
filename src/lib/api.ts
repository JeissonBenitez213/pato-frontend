// src/lib/api.ts

import { DocumentNode, print } from "graphql";
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

/* ------------------------------------------------ */
/* REST */
/* ------------------------------------------------ */

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

/* ------------------------------------------------ */
/* REFRESH */
/* ------------------------------------------------ */

export async function tryRefresh(): Promise<boolean> {
  try {
    await rest("/auth/refresh", {
      method: "POST",
    });

    return true;
  } catch {
    return false;
  }
}

/* ------------------------------------------------ */
/* GRAPHQL */
/* ------------------------------------------------ */

export async function gql<T = unknown>(
  query: string | DocumentNode,
  variables: Record<string, unknown> = {},
  retry = true,
): Promise<T> {
  const finalQuery = typeof query === "string" ? query : print(query);

  const res = await fetch(GRAPHQL_URL, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query: finalQuery,
      variables,
    }),
  });

  const json = (await res.json()) as {
    data?: T;
    errors?: Array<{
      message: string;
      extensions?: {
        code?: string;
      };
    }>;
  };

  if (json.errors?.length) {
    const unauthenticated = json.errors.some(
      (e) =>
        e.extensions?.code === "UNAUTHENTICATED" ||
        /unauthorized|unauthenticated/i.test(e.message),
    );

    if (unauthenticated && retry) {
      const refreshed = await tryRefresh();

      if (refreshed) {
        return gql<T>(query, variables, false);
      }
    }

    throw new ApiError(
      json.errors.map((e) => e.message).join("; "),
      res.status,
      json.errors,
    );
  }

  return json.data as T;
}

/* ------------------------------------------------ */
/* API */
/* ------------------------------------------------ */

export const api = {
  rest,
  gql,
  tryRefresh,

  /* ---------------- AUTH ---------------- */

  me: async () => {
    const res = await fetch(`${API_URL}/auth/me`, {
      credentials: "include",
    });

    const data = await res.json();

    if (!res.ok) {
      throw new ApiError(data?.message || "No autenticado", res.status, data);
    }

    return data as {
      authenticated: boolean;
      id: number;
      nombre_usuario: string;
      is_admin: boolean;
    };
  },

  refresh: () =>
    rest<{ ok: boolean }>("/auth/refresh", {
      method: "POST",
    }),

  login: (nombre_usuario: string, contrasena: string) =>
    rest<{ ok: boolean }>("/auth/login", {
      method: "POST",

      body: JSON.stringify({
        nombre_usuario,
        contraseña: contrasena,
      }),
    }),

  logout: () =>
    rest<{ ok: boolean }>("/auth/logout", {
      method: "POST",
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

  registerAuth: (username: string, provider: string, provider_id: string) =>
    rest("/auth/registerAuth", {
      method: "POST",

      body: JSON.stringify({
        username,
        provider,
        provider_id,
      }),
    }),

  oAuthLogin: (provider: string, provider_id: string) =>
    rest<{ ok: boolean }>("/auth/oAuthLogin", {
      method: "POST",

      body: JSON.stringify({
        provider,
        provider_id,
      }),
    }),

  /* ---------------- POSTS ---------------- */

  getFeed: () =>
    gql<{
      posts: {
        data: Post[];
        nextCursor: number | null;
      };
    }>(FEED_QUERY),

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
    files?: Array<{
      dir: string;
      file_extension: string;
    }>;
  }) =>
    gql(CREATE_POST_MUTATION, {
      input,
    }),

  addReaction: (input: {
    id_post: number;
    like?: boolean;
    favorites?: boolean;
    shares?: boolean;
  }) =>
    gql(ADD_REACTION_MUTATION, {
      input,
    }),

  toggleFollow: (id_user: number) =>
    gql<{
      toggleFollow: {
        following: boolean;

        user: {
          id_usuario: number;
          nombre_usuario: string;
        };
      };
    }>(TOGGLE_FOLLOW_MUTATION, {
      id_user,
    }),

  /* ---------------- COMMENTS ---------------- */

  createComment: (input: {
    id_post: number;
    texto: string;
    id_comentario_padre?: number | null;
  }) =>
    gql(CREATE_COMMENT_MUTATION, {
      input,
    }),

  getComments: (postId: number) =>
    gql(POST_COMMENTS_QUERY, {
      postId,
    }),

  /* ---------------- FILES ---------------- */

  async uploadFiles(files: File[]) {
    const form = new FormData();

    files.forEach((f) => {
      form.append("files", f);
    });

    const res = await fetch(`${API_URL}/files/upload`, {
      method: "POST",

      credentials: "include",

      body: form,
    });

    if (!res.ok) {
      throw new ApiError("Error subiendo archivos", res.status);
    }

    return (await res.json()) as Array<{
      path: string;
      extension: string;
      type: "image" | "video";
    }>;
  },
};

export function fileUrl(dir?: string | null): string | null {
  if (!dir) return null;

  if (dir.startsWith("http")) {
    return dir;
  }

  return `${API_URL}/${dir.replace(/^\/+/, "")}`;
}
