import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeader } from "@/components/app-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { batches } from "@/lib/mock-data";
import { StatusBadge } from "@/components/status-badge";
import { formatDate, formatMoney } from "@/lib/format";
import { Check, X, MessageSquare } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/approvals/queue")({
  component: ApprovalQueue,
  head: () => ({ meta: [{ title: "Approval Queue — Meridian Pay" }] }),
});

function ApprovalQueue() {
  const queue = batches.filter((b) => b.status === "PENDING_APPROVAL" || b.status === "PARTIALLY_APPROVED");
  return (
    <>
      <PageHeader title="Approval Queue" description="Batches awaiting your action. Approve, reject, or return for correction." />
      {queue.length === 0 ? (
        <Card className="border-border/70"><CardContent className="p-12 text-center text-muted-foreground">Nothing pending approval. You're all caught up.</CardContent></Card>
      ) : (
        <div className="space-y-3">
          {queue.map((b) => (
            <Card key={b.id} className="border-border/70 hover:border-accent/40 transition-colors">
              <CardContent className="p-5 grid gap-4 lg:grid-cols-[1fr_auto] items-center">
                <div className="flex flex-wrap gap-x-8 gap-y-2 items-center">
                  <div>
                    <Link to="/batches/$batchId" params={{ batchId: b.id }} className="text-sm font-semibold hover:text-accent">{b.reference}</Link>
                    <div className="text-xs text-muted-foreground">{b.fileName}</div>
                  </div>
                  <div className="text-xs">
                    <div className="text-muted-foreground">Records</div>
                    <div className="font-medium">{b.totalRecords}</div>
                  </div>
                  <div className="text-xs">
                    <div className="text-muted-foreground">Amount</div>
                    <div className="font-medium tabular-nums">{formatMoney(b.totalAmount, b.currency)}</div>
                  </div>
                  <div className="text-xs">
                    <div className="text-muted-foreground">Maker</div>
                    <div className="font-medium">{b.createdBy}</div>
                  </div>
                  <div className="text-xs">
                    <div className="text-muted-foreground">Submitted</div>
                    <div className="font-medium">{formatDate(b.createdAt)}</div>
                  </div>
                  <div className="text-xs">
                    <div className="text-muted-foreground">Current level</div>
                    <div className="font-medium">L{b.currentApprovalLevel} of {b.approvalSteps.length}</div>
                  </div>
                  <StatusBadge status={b.status} />
                </div>
                <div className="flex gap-2 justify-end">
                  <Button variant="outline" size="sm" onClick={() => toast.info("Returned for correction")}>
                    <MessageSquare className="h-4 w-4" /> Return
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => toast.error(`${b.reference} rejected`)}>
                    <X className="h-4 w-4" /> Reject
                  </Button>
                  <Button size="sm" onClick={() => toast.success(`${b.reference} approved at L${b.currentApprovalLevel}`)}>
                    <Check className="h-4 w-4" /> Approve
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </>
  );
}
