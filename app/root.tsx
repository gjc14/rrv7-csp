import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "react-router";

import type { Route } from "./+types/root";
/** [Unsolved] In dev mode vite injects <style> without nonce, causing CSP issues. */
import "./app.css";

import { useNonce } from "./hooks/use-nonce";
import {
  generateNonce,
  getContentSecurityPolicy,
  nonceContext,
} from "./middleware/csp";

const headersMiddleware: Route.unstable_MiddlewareFunction = async (
  { context, request },
  next
) => {
  const nonce = generateNonce();

  const headers = {
    [process.env.NODE_ENV === "production"
      ? "Content-Security-Policy"
      : "Content-Security-Policy-Report-Only"]: getContentSecurityPolicy(nonce),
    /** @see https://developer.mozilla.org/zh-TW/docs/Web/HTTP/Reference/Headers/Strict-Transport-Security */
    "Strict-Transport-Security": "max-age=3600", // 1 hour. HTTPS only
    "X-Frame-Options": "SAMEORIGIN", // Prevent clickjacking
    "X-Content-Type-Options": "nosniff", // Prevent MIME type sniffing
  };

  context.set(nonceContext, nonce);

  try {
    const response = await next();
    for (const [key, value] of Object.entries(headers)) {
      response.headers.set(key, value);
    }

    return response;
  } catch (error) {
    if (isRouteErrorResponse(error)) {
      console.error("Route error response:", error.status, error.statusText);
      throw error.data;
    }
    throw error;
  }
};

export const unstable_middleware: Route.unstable_MiddlewareFunction[] = [
  headersMiddleware,
];

export const links: Route.LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap",
  },
];

export const loader = ({ context }: Route.LoaderArgs) => {
  return { nonce: context.get(nonceContext) };
};

export function Layout({ children }: { children: React.ReactNode }) {
  const nonce = useNonce();

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        {
          /** Vite looks for this meta tag to inject the nonce @see https://vite.dev/guide/features.html#nonce-random */
          import.meta.env.DEV && <meta property="csp-nonce" nonce={nonce} />
        }
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration nonce={nonce} />
        <Scripts nonce={nonce} />
      </body>
    </html>
  );
}

export default function App() {
  return <Outlet />;
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let message = "Oops!";
  let details = "An unexpected error occurred.";
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? "404" : "Error";
    details =
      error.status === 404
        ? "The requested page could not be found."
        : error.statusText || details;
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    details = error.message;
    stack = error.stack;
  }

  return (
    <main className="pt-16 p-4 container mx-auto">
      <h1>{message}</h1>
      <p>{details}</p>
      {stack && (
        <pre className="w-full p-4 overflow-x-auto">
          <code>{stack}</code>
        </pre>
      )}
    </main>
  );
}
