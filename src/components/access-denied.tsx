import { ShieldAlert } from "lucide-react";

export function AccessDenied({ detail }: { detail?: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="max-w-lg text-center">
        <div className="mx-auto h-14 w-14 rounded-full bg-destructive/10 flex items-center justify-center">
          <ShieldAlert className="h-7 w-7 text-destructive" />
        </div>
        <h1 className="mt-6 text-2xl font-semibold tracking-tight">Access Denied</h1>
        <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
          You are not authorized to access Corporate Pay Hub directly. Please access this portal from the approved parent system.
        </p>
        {detail && <p className="mt-4 text-xs text-muted-foreground/80">{detail}</p>}
      </div>
    </div>
  );
}

export function FullScreenLoader({ label = "Authorizing session…" }: { label?: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-3">
        <div className="h-8 w-8 rounded-full border-2 border-muted border-t-primary animate-spin" />
        <div className="text-xs text-muted-foreground">{label}</div>
      </div>
    </div>
  );
}
