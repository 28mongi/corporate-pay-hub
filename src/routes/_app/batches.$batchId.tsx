import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { PageHeader } from "@/components/app-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/status-badge";
import { formatDate, formatMoney, formatNumber } from "@/lib/format";
import { ChevronLeft, Check, X, MessageSquare, Send, Play } from "lucide-react";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { batchApi } from "@/features/batches/api/batch-api";
import { approvalApi } from "@/features/approvals/api/approval-api";
import { ErrorState, TableSkeleton } from "@/components/data-states";
import { useState } from "react";
import { ConfirmActionDialog } from "@/components/confirm-action-dialog";

export const Route = createFileRoute("/_app/batches/$batchId")({
  component: BatchDetail,
  head: () => ({ meta: [{ title: "Batch — Corporate Pay Hub" }] }),
});

type Action = "approve" | "reject" | "return" | "submit" | "process" | null;

function BatchDetail() {
  const { batchId } = Route.useParams();
  const qc = useQueryClient();
  const [action, setAction] = useState<Action>(null);

  const batchQ = useQuery({
    queryKey: ["batch", batchId],
    queryFn: () => batchApi.getBatchById(batchId),
  });
  const itemsQ = useQuery({
    queryKey: ["batch", batchId, "items"],
    queryFn: () => batchApi.getBatchItems(batchId),
  });
  const logsQ = useQuery({
    queryKey: ["batch", batchId, "logs"],
    queryFn: () => batchApi.getProcessingLogs(batchId),
  });

  const invalidateAll = () => {
    qc.invalidateQueries({ queryKey: ["batch", batchId] });
    qc.invalidateQueries({ queryKey: ["batches"] });
    qc.invalidateQueries({ queryKey: ["approvals", "queue"] });
  };

  const submitMut = useMutation({
    mutationFn: () => batchApi.submitBatchForApproval(batchId),
    onSuccess: () => { toast.success("Batch submitted for approval"); invalidateAll(); setAction(null); },
    onError: (e: Error) => toast.error(e.message),
  });
  const processMut = useMutation({
    mutationFn: () => batchApi.processBatch(batchId),
    onSuccess: () => { toast.success("Batch sent to processing"); invalidateAll(); setAction(null); },
    onError: (e: Error) => toast.error(e.message),
  });
  const approveMut = useMutation({
    mutationFn: (comments: string) => approvalApi.approveBatch(batchId, comments),
    onSuccess: () => { toast.success("Approval recorded"); invalidateAll(); setAction(null); },
    onError: (e: Error) => toast.error(e.message),
  });
  const rejectMut = useMutation({
    mutationFn: (comments: string) => approvalApi.rejectBatch(batchId, comments),
    onSuccess: () => { toast.success("Batch rejected"); invalidateAll(); setAction(null); },
    onError: (e: Error) => toast.error(e.message),
  });
  const returnMut = useMutation({
    mutationFn: (comments: string) => approvalApi.returnBatchForCorrection(batchId, comments),
    onSuccess: () => { toast.success("Batch returned for correction"); invalidateAll(); setAction(null); },
    onError: (e: Error) => toast.error(e.message),
  });

  if (batchQ.isLoading) {
    return (
      <>
        <PageHeader title="Loading batch…" />
        <TableSkeleton rows={6} cols={5} />
      </>
    );
  }
  if (batchQ.isError || !batchQ.data) {
    return (
      <>
        <PageHeader title="Batch" />
        <ErrorState message={(batchQ.error as Error)?.message} onRetry={() => batchQ.refetch()} />
      </>
    );
  }

  const batch = batchQ.data;
  const items = itemsQ.data ?? [];
  const logs = logsQ.data ?? [];

  const isPendingApproval = batch.status === "PENDING_APPROVAL" || batch.status === "PARTIALLY_APPROVED";
  const canSubmit = batch.status === "DRAFT" || batch.status === "RETURNED_FOR_CORRECTION";
  const canProcess = batch.status === "APPROVED";

  return (
    <>
      <Link to="/batches" className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground mb-3">
        <ChevronLeft className="h-3.5 w-3.5" /> All batches
      </Link>
      <PageHeader
        title={batch.batchNo}
        description={`${batch.createdBy ? `created by ${batch.createdBy} · ` : ""}${formatDate(batch.createdAt)}`}
        actions={
          <>
            {canSubmit && (
              <Button size="sm" onClick={() => setAction("submit")}>
                <Send className="h-4 w-4" /> Submit for approval
              </Button>
            )}
            {isPendingApproval && (
              <>
                <Button variant="outline" size="sm" onClick={() => setAction("return")}>
                  <MessageSquare className="h-4 w-4" /> Return
                </Button>
                <Button variant="destructive" size="sm" onClick={() => setAction("reject")}>
                  <X className="h-4 w-4" /> Reject
                </Button>
                <Button size="sm" onClick={() => setAction("approve")}>
                  <Check className="h-4 w-4" /> Approve
                </Button>
              </>
            )}
            {canProcess && (
              <Button size="sm" onClick={() => setAction("process")}>
                <Play className="h-4 w-4" /> Process batch
              </Button>
            )}
          </>
        }
      />

      <div className="grid lg:grid-cols-4 gap-4 mb-6">
        {[
          { l: "Status", v: <StatusBadge status={batch.status} /> },
          { l: "Debit Account", v: <span className="text-sm font-mono">{batch.debitAccount ?? "—"}</span> },
          { l: "Records", v: <span className="text-sm font-semibold">{formatNumber(batch.totalRecords)}</span> },
          { l: "Total Amount", v: <span className="text-sm font-semibold">{formatMoney(batch.totalAmount, batch.currency)}</span> },
        ].map((s) => (
          <Card key={s.l} className="border-border/70">
            <CardContent className="p-4">
              <div className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium">{s.l}</div>
              <div className="mt-2">{s.v}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2 border-border/70">
          <CardContent className="p-5">
            <Tabs defaultValue="items">
              <TabsList>
                <TabsTrigger value="items">Payment Items ({items.length})</TabsTrigger>
                <TabsTrigger value="logs">Processing Logs ({logs.length})</TabsTrigger>
              </TabsList>
              <TabsContent value="items" className="mt-4">
                {itemsQ.isLoading ? <TableSkeleton rows={5} cols={5} /> :
                  itemsQ.isError ? <ErrorState message={(itemsQ.error as Error)?.message} onRetry={() => itemsQ.refetch()} /> :
                  items.length === 0 ? (
                    <div className="text-center py-10 text-xs text-muted-foreground">No payment items.</div>
                  ) : (
                    <div className="border border-border rounded-md overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-muted/40 hover:bg-muted/40">
                            <TableHead className="text-xs uppercase">Reference</TableHead>
                            <TableHead className="text-xs uppercase">Beneficiary</TableHead>
                            <TableHead className="text-xs uppercase">Bank</TableHead>
                            <TableHead className="text-xs uppercase text-right">Amount</TableHead>
                            <TableHead className="text-xs uppercase">Status</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {items.map((it) => (
                            <TableRow key={it.id}>
                              <TableCell className="font-mono text-xs">{it.reference}</TableCell>
                              <TableCell>
                                <div>{it.beneficiaryName}</div>
                                <div className="text-xs text-muted-foreground font-mono">{it.beneficiaryAccount}</div>
                              </TableCell>
                              <TableCell>{it.bankCode ?? "—"}</TableCell>
                              <TableCell className="text-right tabular-nums">{formatMoney(it.amount, it.currency)}</TableCell>
                              <TableCell>
                                <span className={`text-xs px-2 py-0.5 rounded ${
                                  it.status === "FAILED" ? "bg-destructive/10 text-destructive" :
                                  it.status === "PROCESSED" ? "bg-success/15 text-success" :
                                  "bg-muted text-muted-foreground"
                                }`}>
                                  {it.status ?? "PENDING"}
                                </span>
                                {it.failureReason && (
                                  <div className="text-[11px] text-destructive mt-0.5">{it.failureReason}</div>
                                )}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
              </TabsContent>
              <TabsContent value="logs" className="mt-4">
                {logsQ.isLoading ? <TableSkeleton rows={4} cols={3} /> :
                  logs.length === 0 ? (
                    <div className="text-center py-10 text-xs text-muted-foreground">No processing logs yet.</div>
                  ) : (
                    <div className="space-y-2">
                      {logs.map((l) => (
                        <div key={l.id} className="border border-border rounded-md p-3 text-xs flex gap-3">
                          <span className="text-muted-foreground w-32 shrink-0">{formatDate(l.timestamp)}</span>
                          <span className={`px-1.5 py-0.5 rounded font-mono ${
                            l.level === "ERROR" ? "bg-destructive/10 text-destructive" :
                            l.level === "WARN" ? "bg-warning/15 text-warning-foreground" :
                            "bg-secondary text-foreground"
                          }`}>{l.level}</span>
                          <span className="flex-1">{l.message}</span>
                          {l.reference && <span className="font-mono text-muted-foreground">{l.reference}</span>}
                        </div>
                      ))}
                    </div>
                  )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <Card className="border-border/70 h-fit">
          <CardContent className="p-5">
            <div className="text-sm font-semibold mb-2">Approval timeline</div>
            <p className="text-xs text-muted-foreground mb-4">
              {batch.currentApprovalLevel != null && batch.totalApprovalLevels != null
                ? `Currently at level ${batch.currentApprovalLevel} of ${batch.totalApprovalLevels}.`
                : "Approval state will appear once the batch enters the approval workflow."}
            </p>
            <div className="rounded-md border border-dashed border-border p-4 text-xs text-muted-foreground">
              Detailed approval history will be displayed here when the backend exposes it.
            </div>
          </CardContent>
        </Card>
      </div>

      <ConfirmActionDialog
        open={action === "submit"}
        onOpenChange={(v) => !v && setAction(null)}
        title="Submit for approval"
        description="Submit this batch into the configured approval workflow."
        confirmLabel="Submit"
        loading={submitMut.isPending}
        onConfirm={() => submitMut.mutateAsync()}
      />
      <ConfirmActionDialog
        open={action === "process"}
        onOpenChange={(v) => !v && setAction(null)}
        title="Process batch"
        description="Send this approved batch to the payment provider for processing."
        confirmLabel="Process"
        loading={processMut.isPending}
        onConfirm={() => processMut.mutateAsync()}
      />
      <ConfirmActionDialog
        open={action === "approve"}
        onOpenChange={(v) => !v && setAction(null)}
        title="Approve batch"
        description="Record your approval at the current level."
        confirmLabel="Approve"
        loading={approveMut.isPending}
        onConfirm={(c) => approveMut.mutateAsync(c)}
      />
      <ConfirmActionDialog
        open={action === "reject"}
        onOpenChange={(v) => !v && setAction(null)}
        title="Reject batch"
        description="Reject this batch. Comments are required and will be recorded in the audit trail."
        confirmLabel="Reject"
        variant="destructive"
        requireComments
        loading={rejectMut.isPending}
        onConfirm={(c) => rejectMut.mutateAsync(c)}
      />
      <ConfirmActionDialog
        open={action === "return"}
        onOpenChange={(v) => !v && setAction(null)}
        title="Return for correction"
        description="Return this batch to the maker for correction. Comments are required."
        confirmLabel="Return"
        requireComments
        loading={returnMut.isPending}
        onConfirm={(c) => returnMut.mutateAsync(c)}
      />
    </>
  );
}
