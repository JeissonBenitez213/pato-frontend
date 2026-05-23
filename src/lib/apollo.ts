import {
  ApolloClient,
  InMemoryCache,
  HttpLink,
  split,
  ApolloLink,
  Observable,
  from,
} from "@apollo/client";

import { onError } from "@apollo/client/link/error";

import { GraphQLWsLink } from "@apollo/client/link/subscriptions";

import { createClient } from "graphql-ws";

import { getMainDefinition } from "@apollo/client/utilities";

import { GRAPHQL_URL, GRAPHQL_WS_URL } from "./env";

import { tryRefresh } from "./api";

/* ---------------- HTTP ---------------- */

const httpLink = new HttpLink({
  uri: GRAPHQL_URL,
  credentials: "include",
});

/* ---------------- HELPERS ---------------- */

async function refreshSession() {
  const ok = await tryRefresh();

  if (!ok) {
    throw new Error("refresh failed");
  }
}

function isUnauthorized(message?: string) {
  if (!message) return false;

  return (
    message.toLowerCase().includes("unauthorized") ||
    message.toLowerCase().includes("unauthenticated")
  );
}

/* ---------------- REFRESH LINK ---------------- */

const refreshLink = onError(({ error, operation, forward }) => {
  const alreadyRetried = operation.getContext().__retry;

  if (alreadyRetried) {
    return;
  }

  const graphQLErrors =
    (error as any)?.errors || (error as any)?.graphQLErrors || [];

  const networkError = (error as any)?.networkError || error;

  const unauthorizedGraphql = graphQLErrors.some(
    (err: any) =>
      err.extensions?.code === "UNAUTHENTICATED" || isUnauthorized(err.message),
  );

  const unauthorizedNetwork =
    networkError?.statusCode === 401 || networkError?.status === 401;

  const shouldRefresh = unauthorizedGraphql || unauthorizedNetwork;

  if (!shouldRefresh) {
    return;
  }

  return new Observable((observer) => {
    refreshSession()
      .then(() => {
        operation.setContext({
          ...operation.getContext(),
          __retry: true,
        });

        const subscriber = forward(operation).subscribe({
          next: (result) => observer.next(result),

          error: (err) => observer.error(err),

          complete: () => observer.complete(),
        });

        return () => subscriber.unsubscribe();
      })
      .catch((err) => {
        observer.error(err);
      });
  });
});

/* ---------------- RESPONSE ERROR LINK ---------------- */
/* detecta errores que vienen en result.errors */

const responseErrorLink = new ApolloLink((operation, forward) => {
  return new Observable((observer) => {
    const sub = forward(operation).subscribe({
      next: async (result) => {
        const unauthorized =
          result.errors?.some(
            (err) =>
              err.extensions?.code === "UNAUTHENTICATED" ||
              isUnauthorized(err.message),
          ) ?? false;

        const alreadyRetried = operation.getContext().__retry;

        if (unauthorized && !alreadyRetried) {
          try {
            await refreshSession();

            operation.setContext({
              ...operation.getContext(),
              __retry: true,
            });

            const retrySub = forward(operation).subscribe({
              next: (retryResult) => observer.next(retryResult),

              error: (retryErr) => observer.error(retryErr),

              complete: () => observer.complete(),
            });

            return () => retrySub.unsubscribe();
          } catch (err) {
            observer.error(err);
          }

          return;
        }

        observer.next(result);
      },

      error: (err) => observer.error(err),

      complete: () => observer.complete(),
    });

    return () => sub.unsubscribe();
  });
});

/* ---------------- WS ---------------- */

const wsLink =
  typeof window !== "undefined"
    ? new GraphQLWsLink(
        createClient({
          url: GRAPHQL_WS_URL,

          lazy: true,

          retryAttempts: Infinity,

          connectionParams: async () => {
            try {
              await refreshSession();
            } catch {}

            return {};
          },
        }),
      )
    : null;

/* ---------------- SPLIT ---------------- */

const httpLinks = from([refreshLink, responseErrorLink, httpLink]);

const splitLink =
  typeof window !== "undefined" && wsLink
    ? split(
        ({ query }) => {
          const definition = getMainDefinition(query);

          return (
            definition.kind === "OperationDefinition" &&
            definition.operation === "subscription"
          );
        },

        wsLink,

        httpLinks,
      )
    : httpLinks;

/* ---------------- CLIENT ---------------- */

export const apolloClient = new ApolloClient({
  link: splitLink,

  cache: new InMemoryCache(),

  defaultOptions: {
    watchQuery: {
      fetchPolicy: "network-only",
    },

    query: {
      fetchPolicy: "network-only",
    },
  },
});
