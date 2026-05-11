import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/app-layout";
import { Card, CardContent } from "@/components/ui/card";
import { useSession } from "@/features/session/session-context";

export const Route = createFileRoute("/_app/settings/company")({
  component: CompanySettings,
  head: () => ({ meta: [{ title: "Company Settings — Corporate Pay Hub" }] }),
});

function CompanySettings() {
  const session = useSession();

  const fields: Array<[string, string | undefined]> = [
    ["Company ID", session.companyId],
    ["Company name", session.companyName],
    ["Biller ID", session.billerId],
    ["Institution ID", session.institutionId],
  ];
  const userFields: Array<[string, string | undefined]> = [
    ["Username", session.username],
    ["Full name", session.fullName],
    ["Email", session.email],
  ];

  return (
    <>
      <PageHeader title="Company Settings" description="Read-only context provided by the parent system." />
      <div className="grid lg:grid-cols-2 gap-4">
        <Card className="border-border/70">
          <CardContent className="p-5 space-y-3">
            <div className="text-sm font-semibold mb-2">Company / Biller</div>
            {fields.map(([k, v]) => (
              <Row key={k} k={k} v={v ?? "—"} />
            ))}
          </CardContent>
        </Card>

        <Card className="border-border/70">
          <CardContent className="p-5 space-y-3">
            <div className="text-sm font-semibold mb-2">Current user</div>
            {userFields.map(([k, v]) => (
              <Row key={k} k={k} v={v ?? "—"} />
            ))}
            {session.roles && session.roles.length > 0 && (
              <Row k="Roles" v={session.roles.join(", ")} />
            )}
            {session.permissions && session.permissions.length > 0 && (
              <Row k="Permissions" v={session.permissions.join(", ")} />
            )}
          </CardContent>
        </Card>
      </div>

      <p className="mt-4 text-xs text-muted-foreground max-w-2xl">
        User and role management is handled by the parent system. This portal does not provide user creation, role assignment, or permission editing.
      </p>
    </>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex items-center justify-between text-sm border-b border-border/60 pb-2 last:border-b-0 last:pb-0">
      <span className="text-muted-foreground">{k}</span>
      <span className="font-medium font-mono text-xs">{v}</span>
    </div>
  );
}
