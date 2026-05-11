import { Link, Outlet, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard, FileStack, Upload, CheckCircle2, Settings2,
  ScrollText, BarChart3, Building2, Bell, ShieldCheck,
} from "lucide-react";
import { useSession } from "@/features/session/session-context";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuLabel,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { APP_NAME } from "@/lib/api-client";

const nav = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/batches", label: "Payment Batches", icon: FileStack },
  { to: "/batches/upload", label: "Upload Payment File", icon: Upload },
  { to: "/approvals/queue", label: "Approval Queue", icon: CheckCircle2 },
  { to: "/approvals/configurations", label: "Approval Configuration", icon: Settings2 },
  { to: "/audit-logs", label: "Audit Logs", icon: ScrollText },
  { to: "/reports", label: "Reports", icon: BarChart3 },
  { to: "/settings/company", label: "Company Settings", icon: Building2 },
] as const;

export function AppLayout() {
  const session = useSession();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  const fullName = session.fullName ?? session.username ?? "User";
  const initials = fullName.split(" ").map((s) => s[0]).slice(0, 2).join("").toUpperCase();
  const companyName = session.companyName ?? session.companyId ?? "—";
  const rolesLabel = session.roles?.join(", ") ?? "";

  return (
    <div className="flex min-h-screen w-full bg-background">
      <aside className="hidden lg:flex w-64 flex-col bg-sidebar text-sidebar-foreground border-r border-sidebar-border">
        <div className="px-5 py-5 flex items-center gap-2.5 border-b border-sidebar-border">
          <div className="h-9 w-9 rounded-lg bg-sidebar-primary/15 flex items-center justify-center ring-1 ring-sidebar-primary/30">
            <ShieldCheck className="h-5 w-5 text-sidebar-primary" />
          </div>
          <div>
            <div className="text-sm font-semibold tracking-tight text-white">{APP_NAME}</div>
            <div className="text-[11px] text-sidebar-foreground/60">Corporate Portal</div>
          </div>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {nav.map((item) => {
            const active = pathname === item.to || (item.to !== "/dashboard" && pathname.startsWith(item.to));
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "flex items-center gap-2.5 px-3 py-2 rounded-md text-sm transition-colors",
                  active
                    ? "bg-sidebar-accent text-white font-medium"
                    : "text-sidebar-foreground/75 hover:bg-sidebar-accent/60 hover:text-white"
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="px-4 py-3 border-t border-sidebar-border text-[11px] text-sidebar-foreground/55">
          v1.0 · Secure session
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-14 border-b border-border bg-card flex items-center justify-between px-4 lg:px-6">
          <div className="flex items-center gap-3">
            <Building2 className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">{companyName}</span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-4 w-4" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="gap-2 px-2">
                  <div className="h-7 w-7 rounded-full bg-primary text-primary-foreground text-xs font-semibold flex items-center justify-center">
                    {initials}
                  </div>
                  <div className="hidden md:flex flex-col items-start leading-tight">
                    <span className="text-xs font-medium">{fullName}</span>
                    {rolesLabel && <span className="text-[10px] text-muted-foreground">{rolesLabel}</span>}
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64">
                <DropdownMenuLabel className="font-normal">
                  <div className="text-sm font-medium">{fullName}</div>
                  {session.email && <div className="text-xs text-muted-foreground">{session.email}</div>}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <div className="px-2 py-2 text-[11px] text-muted-foreground">
                  Session managed by parent system. Sign out from there to end your session.
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>
        <main className="flex-1 px-4 lg:px-6 py-6 max-w-[1500px] w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export function PageHeader({ title, description, actions }: { title: string; description?: string; actions?: React.ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="text-[22px] font-semibold tracking-tight">{title}</h1>
        {description && <p className="text-sm text-muted-foreground mt-1">{description}</p>}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}
