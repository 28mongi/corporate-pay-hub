import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { PageHeader } from "@/components/app-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/status-badge";
import { formatDate, formatMoney } from "@/lib/format";
import { Check, X, MessageSquare } from "lucide-react";
import { toast } from "sonner";
import { approvalApi } from "@/features/approvals/api/approval-api";
import { EmptyState, ErrorState, TableSkeleton } from "@/components/data-states";
import { useState } from "react";
import { ConfirmActionDialog } from "@/components/confirm-action-dialog";

export const Route = createFileRoute("/_app/approvals/queue")({
  component: ApprovalQueue,
  head: () => ({ meta: [{ title: "Approval Queue — Corporate Pay Hub" }] }),
});

type Pending = { id: string; action: "approve" | "reject" | "return" } | null;

function ApprovalQueue() {
  const qc = useQueryClient();
  const [pending, setPending] = useState<Pending>(null);

  const queueQ = useQuery({
    queryKey: ["approvals", "queue"],
    queryFn: () => approvalApi.getApprovalQueue(),
  });

  const invalidateAll = () => {
    qc.invalidateQueries({ queryKey: ["approvals", "queue"] });
    qc.invalidateQueries({ queryKey: ["batches"] });
    if (pending) qc.invalidateQueries({ queryKey: ["batch", pending.id] });
  };

  const approveMut = useMutation({
    mutationFn: ({ id, comments }: { id: string; comments: string }) => approvalApi.approveBatch(id, comments),
    onSuccess: () => { toast.success("Approval recorded"); invalidateAll(); setPending(null); },
    onError: (e: Error) => toast.error(e.message),
  });
  const rejectMut = useMutation({
    mutationFn: ({ id, comments }: { id: string; comments: string }) => approvalApi.rejectBatch(id, comments),
    onSuccess: () => { toast.success("Batch rejected"); invalidateAll(); setPending(null); },
    onError: (e: Error) => toast.error(e.message),
  });
  const returnMut = useMutation({
    mutationFn: ({ id, comments }: { id: string; comments: string }) => approvalApi.returnBatchForCorrection(id, comments),
    onSuccess: () => { toast.success("Batch returned"); invalidateAll(); setPending(null); },
    onError: (e: Error) => toast.error(e.message),
  });

  if (queueQ.isLoading) return (<><PageHeader title="Approval Queue" /><TableSkeleton rows={4} cols={5} /></>);
  if (queueQ.isError) return (<><PageHeader title="Approval Queue" /><ErrorState message={(queueQ.error as Error)?.message} onRetry={() => queueQ.refetch()} /></>);

  const queue = queueQ.data ?? [];

  return (
    <>
      <PageHeader title="Approval Queue" description="Batches awaiting your action. Approve, reject, or return for correction." />
      {queue.length === 0 ? (
        <EmptyState title="You're all caught up" description="There are no batches pending your approval." icon={Check} />
      ) : (
        <div className="space-y-3">
          {queue.map((b) => (
            <Card key={b.id} className="border-border/70 hover:border-accent/40 transition-colors">
              <CardContent className="p-5 grid gap-4 lg:grid-cols-[1fr_auto] items-center">
                <div className="flex flex-wrap gap-x-8 gap-y-2 items-center">
                  <div>
                    <Link to="/batches/$batchId" params={{ batchId: b.id }} className="text-sm font-semibold hover:text-accent">{b.batchNo}</Link>
                    {b.fileName && <div className="text-xs text-muted-foreground">{b.fileName}</div>}
                  </div>
                  <Field k="Records" v={String(b.totalRecords)} />
                  <Field k="Amount" v={formatMoney(b.totalAmount, b.currency)} mono />
                  <Field k="Maker" v={b.createdBy ?? "—"} />
                  <Field k="Submitted" v={formatDate(b.submittedAt ?? b.createdAt)} />
                  <Field k="Level" v={`L${b.awaitingLevel ?? b.currentApprovalLevel ?? "?"}${b.totalApprovalLevels ? ` of ${b.totalApprovalLevels}` : ""}`} />
                  <StatusBadge status={b.status} />
                </div>
                <div className="flex gap-2 justify-end">
                  <Button variant="outline" size="sm" onClick={() => setPending({ id: b.id, action: "return" })}>
                    <MessageSquare className="h-4 w-4" /> Return
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => setPending({ id: b.id, action: "reject" })}>
                    <X className="h-4 w-4" /> Reject
                  </Button>
                  <Button size="sm" onClick={() => setPending({ id: b.id, action: "approve" })}>
                    <Check className="h-4 w-4" /> Approve
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <ConfirmActionDialog
        open={pending?.action === "approve"}
        onOpenChange={(v) => !v && setPending(null)}
        title="Approve batch"
        description="Record your approval at the current level."
        confirmLabel="Approve"
        loading={approveMut.isPending}
        onConfirm={(c) => pending && approveMut.mutateAsync({ id: pending.id, comments: c })}
      />
      <ConfirmActionDialog
        open={pending?.action === "reject"}
        onOpenChange={(v) => !v && setPending(null)}
        title="Reject batch"
        description="Reject this batch. Comments are required."
        confirmLabel="Reject"
        variant="destructive"
        requireComments
        loading={rejectMut.isPending}
        onConfirm={(c) => pending && rejectMut.mutateAsync({ id: pending.id, comments: c })}
      />
      <ConfirmActionDialog
        open={pending?.action === "return"}
        onOpenChange={(v) => !v && setPending(null)}
        title="Return for correction"
        description="Send this batch back to the maker. Comments are required."
        confirmLabel="Return"
        requireComments
        loading={returnMut.isPending}
        onConfirm={(c) => pending && returnMut.mutateAsync({ id: pending.id, comments: c })}
      />
    </>
  );
}

function Field({ k, v, mono }: { k: string; v: string; mono?: boolean }) {
  return (
    <div className="text-xs">
      <div className="text-muted-foreground">{k}</div>
      <div className={`font-medium ${mono ? "tabular-nums" : ""}`}>{v}</div>
    </div>
  );
}
