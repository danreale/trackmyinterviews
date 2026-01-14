import {
  isRouteErrorResponse,
  Link,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useRouteLoaderData,
} from "react-router";

import type { Route } from "./+types/root";
import { getUser } from "./auth.server";
import "./app.css";

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

export async function loader({ request }: Route.LoaderArgs) {
  const user = await getUser(request);
  return { user };
}

export function Layout({ children }: { children: React.ReactNode }) {
  const data = useRouteLoaderData<typeof loader>("root");
  const user = data?.user;

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        <header className="bg-gray-900 text-white p-4 shadow-md">
          <div className="container mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative flex items-center justify-center sm:justify-start w-full sm:w-auto">
              <Link to="/" className="text-xl font-bold hover:text-gray-300">
                Interview Tracker
              </Link>
              {user && (
                <div className="absolute right-0 sm:hidden">
                  <img
                    src={user.profile.photo}
                    alt={user.profile.displayName}
                    className="w-8 h-8 rounded-full border-2 border-gray-700 object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
              )}
            </div>

            {user && (
              <nav className="flex gap-6">
                <Link
                  to={`/applications/${user.profile.id}`}
                  className="hover:text-gray-300 font-medium"
                >
                  Applications
                </Link>
                <Link
                  to={`/calendar/${user.profile.id}`}
                  className="hover:text-gray-300 font-medium"
                >
                  Interviews
                </Link>
              </nav>
            )}

            {user && (
              <div className="hidden sm:flex items-center gap-3">
                <span className="text-sm font-medium">
                  {user.profile.displayName}
                </span>
                <img
                  src={user.profile.photo}
                  alt={user.profile.displayName}
                  className="w-10 h-10 rounded-full border-2 border-gray-700 object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
            )}
          </div>
        </header>
        {children}
        <ScrollRestoration />
        <Scripts />
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
