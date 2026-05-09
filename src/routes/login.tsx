import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ShieldCheck, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";

export const Route = createFileRoute("/login")({
  component: LoginPage,
  head: () => ({ meta: [{ title: "Sign in — Meridian Pay" }] }),
});

function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("aisha@meridian.co");
  const [password, setPassword] = useState("••••••••");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      toast.success("Signed in successfully");
      navigate({ to: "/dashboard" });
    } catch {
      toast.error("Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-background">
      <div className="hidden lg:flex flex-col justify-between bg-sidebar text-sidebar-foreground p-10 relative overflow-hidden">
        <div className="absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_30%_20%,oklch(0.62_0.16_255/0.4),transparent_50%),radial-gradient(circle_at_80%_80%,oklch(0.62_0.16_255/0.25),transparent_50%)]" />
        <div className="relative flex items-center gap-2.5">
          <div className="h-10 w-10 rounded-lg bg-sidebar-primary/20 flex items-center justify-center ring-1 ring-sidebar-primary/40">
            <ShieldCheck className="h-5 w-5 text-sidebar-primary" />
          </div>
          <div>
            <div className="text-base font-semibold text-white">Meridian Pay</div>
            <div className="text-xs text-sidebar-foreground/60">Corporate Payments Portal</div>
          </div>
        </div>
        <div className="relative space-y-5 max-w-md">
          <h1 className="text-3xl font-semibold text-white tracking-tight leading-tight">
            Bulk payments, secured by sequential approvals.
          </h1>
          <p className="text-sm text-sidebar-foreground/70 leading-relaxed">
            Upload, validate, and approve corporate payment batches across RTGS, TIPS, GEPG and internal transfers — with full audit trail and role-based controls.
          </p>
          <div className="grid grid-cols-3 gap-4 pt-4">
            {[
              { k: "Bank-grade", v: "Security" },
              { k: "Maker-Checker", v: "Workflow" },
              { k: "ISO 27001", v: "Compliant" },
            ].map((s) => (
              <div key={s.k} className="border border-sidebar-border/70 rounded-md p-3 bg-white/5">
                <div className="text-[11px] text-sidebar-foreground/60">{s.k}</div>
                <div className="text-sm font-medium text-white">{s.v}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="relative text-[11px] text-sidebar-foreground/50">
          © 2026 Meridian Holdings · All transactions are monitored and logged.
        </div>
      </div>

      <div className="flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-sm">
          <div className="mb-8">
            <h2 className="text-2xl font-semibold tracking-tight">Sign in to your portal</h2>
            <p className="text-sm text-muted-foreground mt-1.5">Use your corporate credentials to continue.</p>
          </div>
          <form onSubmit={submit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email">Work email</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <button type="button" className="text-xs text-accent hover:underline">Forgot?</button>
              </div>
              <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="current-password" />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              <Lock className="h-4 w-4" /> {loading ? "Signing in…" : "Sign in securely"}
            </Button>
            <p className="text-xs text-muted-foreground text-center pt-2">
              Single Sign-On via Keycloak / OIDC supported.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
