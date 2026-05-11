import { QueryClient, QueryClientProvider, useQuery } from "@tanstack/react-query";
import {
  Outlet,
  createRootRouteWithContext,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { Toaster } from "@/components/ui/sonner";
import { sessionApi } from "@/features/session/api/session-api";
import { SessionProvider } from "@/features/session/session-context";
import { AccessDenied, FullScreenLoader } from "@/components/access-denied";
import { ApiError } from "@/lib/api-client";

import appCss from "../styles.css?url";

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Corporate Pay Hub" },
      { name: "description", content: "Corporate Pay Hub — secure embedded portal for bulk payment processing." },
    ],
    links: [{ rel: "stylesheet", href: appCss }],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFound,
  errorComponent: ErrorPage,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head><HeadContent /></head>
      <body>{children}<Scripts /></body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  return (
    <QueryClientProvider client={queryClient}>
      <SessionGate>
        <Outlet />
      </SessionGate>
      <Toaster richColors position="top-right" />
    </QueryClientProvider>
  );
}

function SessionGate({ children }: { children: React.ReactNode }) {
  const { data, isLoading, error } = useQuery({
    queryKey: ["session", "me"],
    queryFn: () => sessionApi.getCurrentSession(),
    retry: false,
    staleTime: 5 * 60 * 1000,
  });

  if (isLoading) return <FullScreenLoader />;

  if (error) {
    const status = error instanceof ApiError ? error.status : 0;
    if (status === 401 || status === 403) return <AccessDenied />;
    return <AccessDenied detail="Unable to verify your session with the parent system." />;
  }

  if (!data) return <AccessDenied />;

  return <SessionProvider value={data}>{children}</SessionProvider>;
}

function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold tracking-tight">404</h1>
        <p className="mt-2 text-sm text-muted-foreground">This page does not exist.</p>
      </div>
    </div>
  );
}

function ErrorPage({ error }: { error: Error }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold">Something went wrong</h1>
        <p className="mt-2 text-sm text-muted-foreground">{error.message}</p>
      </div>
    </div>
  );
}
