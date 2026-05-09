import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeader } from "@/components/app-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { matrices, users } from "@/lib/mock-data";
import { Plus, Layers } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatMoney } from "@/lib/format";

export const Route = createFileRoute("/_app/approvals/configurations/")({
  component: Configurations,
  head: () => ({ meta: [{ title: "Approval Matrix — Meridian Pay" }] }),
});

function Configurations() {
  return (
    <>
      <PageHeader
        title="Approval Configurations"
        description="Define sequential approval levels and amount thresholds for each payment type."
        actions={
          <Button asChild size="sm"><Link to="/approvals/configurations/new"><Plus className="h-4 w-4" /> New matrix</Link></Button>
        }
      />
      <div className="grid lg:grid-cols-2 gap-4">
        {matrices.map((m) => (
          <Card key={m.id} className="border-border/70">
            <CardContent className="p-5">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-md bg-secondary flex items-center justify-center"><Layers className="h-4 w-4 text-primary" /></div>
                    <div className="text-sm font-semibold">{m.name}</div>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {m.paymentType ? `Applies to ${m.paymentType}` : "Applies to all payment types"}
                  </div>
                </div>
                <Badge variant={m.active ? "default" : "outline"}>{m.active ? "Active" : "Inactive"}</Badge>
              </div>
              <div className="space-y-2 mt-4">
                {m.levels.map((lvl) => {
                  const approvers = users.filter((u) => lvl.approverIds.includes(u.id));
                  return (
                    <div key={lvl.level} className="border border-border rounded-md p-3 flex items-center gap-4">
                      <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground text-xs font-semibold flex items-center justify-center">L{lvl.level}</div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium">{lvl.name}</div>
                        <div className="text-xs text-muted-foreground truncate">
                          {approvers.map((a) => a.fullName).join(", ")} · {lvl.requiredApprovals} required
                        </div>
                      </div>
                      {(lvl.minAmount || lvl.maxAmount) && (
                        <div className="text-xs text-right text-muted-foreground">
                          {lvl.minAmount ? `≥ ${formatMoney(lvl.minAmount)}` : ""}
                          {lvl.maxAmount ? ` ≤ ${formatMoney(lvl.maxAmount)}` : ""}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  );
}
