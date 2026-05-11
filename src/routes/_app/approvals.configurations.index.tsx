import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { PageHeader } from "@/components/app-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Layers } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatMoney } from "@/lib/format";
import { approvalConfigApi } from "@/features/approvals/api/approval-config-api";
import { EmptyState, ErrorState, TableSkeleton } from "@/components/data-states";

export const Route = createFileRoute("/_app/approvals/configurations/")({
  component: Configurations,
  head: () => ({ meta: [{ title: "Approval Configurations — Corporate Pay Hub" }] }),
});

function Configurations() {
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["approval-configs"],
    queryFn: () => approvalConfigApi.getApprovalConfigs(),
  });

  return (
    <>
      <PageHeader
        title="Approval Configurations"
        description="Sequential approval levels and amount thresholds."
        actions={
          <Button asChild size="sm"><Link to="/approvals/configurations/new"><Plus className="h-4 w-4" /> New configuration</Link></Button>
        }
      />
      {isLoading ? <TableSkeleton rows={4} cols={4} /> :
        isError ? <ErrorState message={(error as Error)?.message} onRetry={() => refetch()} /> :
        !data || data.length === 0 ? (
          <EmptyState title="No approval configurations" description="Create one to define the sequential approval flow for batches." />
        ) : (
          <div className="grid lg:grid-cols-2 gap-4">
            {data.map((m) => (
              <Card key={m.id} className="border-border/70">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-md bg-secondary flex items-center justify-center"><Layers className="h-4 w-4 text-primary" /></div>
                        <div className="text-sm font-semibold">{m.name}</div>
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {formatMoney(m.minAmount)} – {formatMoney(m.maxAmount)}
                      </div>
                    </div>
                    {m.active != null && <Badge variant={m.active ? "default" : "outline"}>{m.active ? "Active" : "Inactive"}</Badge>}
                  </div>
                  <div className="space-y-2 mt-4">
                    {m.levels.map((lvl) => (
                      <div key={lvl.levelNumber} className="border border-border rounded-md p-3 flex items-center gap-4">
                        <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground text-xs font-semibold flex items-center justify-center">L{lvl.levelNumber}</div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium">{lvl.levelName}</div>
                          <div className="text-xs text-muted-foreground truncate">
                            {lvl.userIds.length} approver(s) · {lvl.requiredApprovals} required
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
    </>
  );
}
