import { useRouteError, useRouteLoaderData } from "react-router";

/**
 * This hook retrieves the nonce value from the root route's loader data.
 * You may use this hook anywhere within root in client components.
 *
 * If your looking for server side usage, please refer to /app/middleware/csp.ts,
 * and see example usage in app/root.tsx or app/entry.server.ts.
 */
export const useNonce = () => {
  const loaderData: unknown = useRouteLoaderData("root");
  const error = useRouteError();

  const nonce =
    !error &&
    loaderData &&
    typeof loaderData === "object" &&
    "nonce" in loaderData &&
    typeof loaderData.nonce === "string"
      ? loaderData.nonce
      : undefined;

  return nonce;
};
