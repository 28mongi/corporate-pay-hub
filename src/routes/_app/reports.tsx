import { createFileRoute } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { PageHeader } from "@/components/app-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileBarChart2, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";
import { reportApi, type ReportParams } from "@/features/reports/api/report-api";

export const Route = createFileRoute("/_app/reports")({
  component: Reports,
  head: () => ({ meta: [{ title: "Reports — Corporate Pay Hub" }] }),
});

const reports = [
  { id: "payment-batches", name: "Payment Batches Report", desc: "Detailed batch outcomes including processed, failed and pending items.", fn: reportApi.getPaymentBatchReport },
  { id: "failed-tx", name: "Failed Transactions Report", desc: "All transactions that failed, grouped by failure reason.", fn: reportApi.getFailedTransactionsReport },
  { id: "approvals", name: "Approval Report", desc: "Approval activity per level, approver and turnaround time.", fn: reportApi.getApprovalReport },
  { id: "user-activity", name: "User Activity Report", desc: "Sign-ins, sensitive actions and configuration changes per user.", fn: reportApi.getUserActivityReport },
] as const;

function Reports() {
  const [params, setParams] = useState<ReportParams>({});

  return (
    <>
      <PageHeader title="Reports" description="Generate operational and compliance reports." />

      <Card className="border-border/70 mb-4">
        <CardContent className="p-4 grid sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <div className="space-y-1.5">
            <Label className="text-xs">From date</Label>
            <Input type="date" value={params.fromDate ?? ""} onChange={(e) => setParams((p) => ({ ...p, fromDate: e.target.value || undefined }))} />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">To date</Label>
            <Input type="date" value={params.toDate ?? ""} onChange={(e) => setParams((p) => ({ ...p, toDate: e.target.value || undefined }))} />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Status</Label>
            <Select value={params.status ?? "ALL"} onValueChange={(v) => setParams((p) => ({ ...p, status: v === "ALL" ? undefined : v }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All</SelectItem>
                {["PENDING_APPROVAL","APPROVED","REJECTED","COMPLETED","FAILED","PROCESSING"].map((s) => (
                  <SelectItem key={s} value={s}>{s.replace(/_/g, " ")}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Transaction type</Label>
            <Input value={params.transactionType ?? ""} onChange={(e) => setParams((p) => ({ ...p, transactionType: e.target.value || undefined }))} placeholder="Any" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Currency</Label>
            <Input value={params.currency ?? ""} onChange={(e) => setParams((p) => ({ ...p, currency: e.target.value.toUpperCase() || undefined }))} maxLength={3} placeholder="Any" />
          </div>
        </CardContent>
      </Card>

      <div className="grid sm:grid-cols-2 gap-4">
        {reports.map((r) => (
          <ReportCard key={r.id} name={r.name} desc={r.desc} fetcher={() => r.fn(params)} />
        ))}
      </div>
    </>
  );
}

function ReportCard({ name, desc, fetcher }: { name: string; desc: string; fetcher: () => Promise<unknown> }) {
  const mut = useMutation({
    mutationFn: fetcher,
    onSuccess: () => toast.success(`${name} generated`),
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <Card className="border-border/70">
      <CardContent className="p-5 flex items-start gap-4">
        <div className="h-10 w-10 rounded-md bg-secondary flex items-center justify-center"><FileBarChart2 className="h-5 w-5 text-primary" /></div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-semibold">{name}</div>
          <div className="text-xs text-muted-foreground mt-1">{desc}</div>
          <div className="flex gap-2 mt-3">
            <Button size="sm" variant="outline" disabled={mut.isPending} onClick={() => mut.mutate()}>
              <RefreshCw className="h-4 w-4" /> {mut.isPending ? "Generating…" : "Generate"}
            </Button>
          </div>
          {mut.data !== undefined && (
            <pre className="mt-3 text-[11px] text-muted-foreground bg-muted/40 p-2 rounded max-h-40 overflow-auto">
              {JSON.stringify(mut.data, null, 2).slice(0, 400)}
              {JSON.stringify(mut.data, null, 2).length > 400 ? "…" : ""}
            </pre>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
