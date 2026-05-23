import {
  ApolloClient,
  InMemoryCache,
  HttpLink,
  split,
  ApolloLink,
  Observable,
} from "@apollo/client";

import { GraphQLWsLink } from "@apollo/client/link/subscriptions";
import { createClient } from "graphql-ws";
import { getMainDefinition } from "@apollo/client/utilities";

import { GRAPHQL_URL, GRAPHQL_WS_URL } from "./env";
import { tryRefresh } from "./api";

/* ---------------- HTTP LINK (cookies) ---------------- */
const httpLink = new HttpLink({
  uri: GRAPHQL_URL,
  credentials: "include",
});

/* ---------------- REFRESH HELPER ---------------- */
async function refreshSession() {
  const ok = await tryRefresh();
  if (!ok) {
    throw new Error("Refresh failed");
  }
}

function isUnauthorizedError(err: any) {
  return (
    err?.extensions?.code === "UNAUTHENTICATED" ||
    err?.message?.toLowerCase().includes("unauthorized") ||
    err?.message?.toLowerCase().includes("unauthenticated")
  );
}

/* ---------------- ERROR + RETRY LINK ---------------- */
const authRetryLink = new ApolloLink((operation, forward) => {
  return new Observable((observer) => {
    const subscription = forward(operation).subscribe({
      next: (result) => observer.next(result),
      error: async (err) => {
        const graphQLErrors = err?.graphQLErrors;
        const networkError = err?.networkError || err;

        const hasUnauthorized =
          graphQLErrors?.some(isUnauthorizedError) ||
          (networkError && networkError.statusCode === 401) ||
          (networkError && networkError.status === 401) ||
          isUnauthorizedError(err);

        if (!hasUnauthorized) {
          observer.error(err);
          return;
        }

        console.log("Apollo authRetryLink: Unauthorized detected", {
          err,
          graphQLErrors,
          networkError,
        });

        const context = operation.getContext();
        if (context.__retry) {
          console.log(
            "Apollo authRetryLink: Already retried once, skipping refresh",
          );
          observer.error(err);
          return;
        }
        operation.setContext({ ...context, __retry: true });

        try {
          await refreshSession();
          console.log(
            "Apollo authRetryLink: Refresh succeeded, retrying operation",
          );
          const retrySubscription = forward(operation).subscribe({
            next: (result) => observer.next(result),
            error: (error) => observer.error(error),
            complete: () => observer.complete(),
          });

          return () => retrySubscription.unsubscribe();
        } catch (refreshError) {
          console.log("Apollo authRetryLink: Refresh failed", refreshError);
          observer.error(refreshError);
        }
      },
      complete: () => observer.complete(),
    });

    return () => {
      subscription.unsubscribe();
    };
  });
});

/* ---------------- WS LINK (subscriptions) ---------------- */
const wsLink =
  typeof window !== "undefined"
    ? new GraphQLWsLink(
        createClient({
          url: GRAPHQL_WS_URL,

          connectionParams: async () => {
            try {
              console.log("Apollo wsLink: refreshing before WS handshake");
              await refreshSession();
              console.log(
                "Apollo wsLink: refresh before WS handshake succeeded",
              );
            } catch (err) {
              console.log(
                "Apollo wsLink: refresh before WS handshake failed",
                err,
              );
            }
            return {};
          },

          lazy: true,
          retryAttempts: Infinity,
        }),
      )
    : null;

/* ---------------- SPLIT LINK ---------------- */
const splitLink =
  typeof window !== "undefined" && wsLink
    ? split(
        ({ query }) => {
          const def = getMainDefinition(query);
          return (
            def.kind === "OperationDefinition" &&
            def.operation === "subscription"
          );
        },
        wsLink,
        ApolloLink.from([authRetryLink, httpLink]),
      )
    : ApolloLink.from([authRetryLink, httpLink]);

/* ---------------- CLIENT ---------------- */
export const apolloClient = new ApolloClient({
  link: splitLink,
  cache: new InMemoryCache(),

  defaultOptions: {
    watchQuery: {
      fetchPolicy: "network-only",
    },
  },
});
