import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { PageHeader } from "@/components/app-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { batches } from "@/lib/mock-data";
import { StatusBadge } from "@/components/status-badge";
import { formatDate, formatMoney } from "@/lib/format";
import { ChevronLeft, Check, X, MessageSquare, FileDown, Send } from "lucide-react";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/batches/$batchId")({
  component: BatchDetail,
  loader: ({ params }) => {
    const batch = batches.find((b) => b.id === params.batchId);
    if (!batch) throw notFound();
    return batch;
  },
  head: ({ loaderData }) => ({ meta: [{ title: `${loaderData?.reference ?? "Batch"} — Meridian Pay` }] }),
  notFoundComponent: () => <div className="p-8 text-center text-muted-foreground">Batch not found.</div>,
});

function BatchDetail() {
  const batch = Route.useLoaderData() as ReturnType<typeof Route.options.loader>;

  return (
    <>
      <Link to="/batches" className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground mb-3">
        <ChevronLeft className="h-3.5 w-3.5" /> All batches
      </Link>
      <PageHeader
        title={batch.reference}
        description={`${batch.fileName} · created by ${batch.createdBy} on ${formatDate(batch.createdAt)}`}
        actions={
          <>
            <Button variant="outline" size="sm"><FileDown className="h-4 w-4" /> Export</Button>
            {batch.status === "PENDING_APPROVAL" || batch.status === "PARTIALLY_APPROVED" ? (
              <>
                <Button variant="outline" size="sm" onClick={() => toast.info("Returned to maker for correction")}><MessageSquare className="h-4 w-4" /> Return</Button>
                <Button variant="destructive" size="sm" onClick={() => toast.error("Batch rejected")}><X className="h-4 w-4" /> Reject</Button>
                <Button size="sm" onClick={() => toast.success("Approval recorded")}><Check className="h-4 w-4" /> Approve</Button>
              </>
            ) : batch.status === "APPROVED" ? (
              <Button size="sm" onClick={() => toast.success("Submitted to payment provider")}><Send className="h-4 w-4" /> Submit for processing</Button>
            ) : null}
          </>
        }
      />

      <div className="grid lg:grid-cols-4 gap-4 mb-6">
        {[
          { l: "Status", v: <StatusBadge status={batch.status} /> },
          { l: "Type", v: <span className="text-sm font-medium">{batch.type}</span> },
          { l: "Records", v: <span className="text-sm font-semibold">{batch.totalRecords}</span> },
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
                <TabsTrigger value="items">Payment Items ({batch.items.length})</TabsTrigger>
                <TabsTrigger value="results">Processing Result</TabsTrigger>
              </TabsList>
              <TabsContent value="items" className="mt-4">
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
                      {batch.items.map((it) => (
                        <TableRow key={it.id}>
                          <TableCell className="font-mono text-xs">{it.reference}</TableCell>
                          <TableCell>
                            <div>{it.beneficiaryName}</div>
                            <div className="text-xs text-muted-foreground font-mono">{it.beneficiaryAccount}</div>
                          </TableCell>
                          <TableCell>{it.bankCode}</TableCell>
                          <TableCell className="text-right tabular-nums">{formatMoney(it.amount, it.currency)}</TableCell>
                          <TableCell>
                            <span className={`text-xs px-2 py-0.5 rounded ${it.status === "FAILED" ? "bg-destructive/10 text-destructive" : it.status === "PROCESSED" ? "bg-success/15 text-success" : "bg-muted text-muted-foreground"}`}>
                              {it.status ?? "PENDING"}
                            </span>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>
              <TabsContent value="results" className="mt-4">
                <div className="grid grid-cols-3 gap-3">
                  <Stat label="Processed" value={String(batch.processedCount ?? 0)} tone="success" />
                  <Stat label="Failed" value={String(batch.failedCount ?? 0)} tone="destructive" />
                  <Stat label="Pending" value={String(batch.totalRecords - (batch.processedCount ?? 0) - (batch.failedCount ?? 0))} />
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <Card className="border-border/70 h-fit">
          <CardContent className="p-5">
            <div className="text-sm font-semibold mb-4">Approval Timeline</div>
            <ol className="relative border-l border-border ml-2 space-y-5">
              <Step title="Batch created" who={batch.createdBy} when={formatDate(batch.createdAt)} done />
              {batch.approvalSteps.map((s) => (
                <Step
                  key={s.level}
                  title={`Level ${s.level} approval`}
                  who={s.approverName ?? "Awaiting approver"}
                  when={s.actedAt ? formatDate(s.actedAt) : "Pending"}
                  comments={s.comments}
                  done={s.status === "APPROVED"}
                  rejected={s.status === "REJECTED"}
                />
              ))}
              {(batch.status === "PROCESSING" || batch.status === "COMPLETED" || batch.status === "PARTIALLY_COMPLETED") && (
                <Step title="Submitted for processing" who="System" when="—" done />
              )}
            </ol>
          </CardContent>
        </Card>
      </div>
    </>
  );
}

function Stat({ label, value, tone }: { label: string; value: string; tone?: "success" | "destructive" }) {
  const cls = tone === "success" ? "text-success" : tone === "destructive" ? "text-destructive" : "text-foreground";
  return (
    <div className="border border-border rounded-md p-4">
      <div className="text-xs uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className={`text-2xl font-semibold mt-1 ${cls}`}>{value}</div>
    </div>
  );
}

function Step({ title, who, when, comments, done, rejected }: { title: string; who: string; when: string; comments?: string; done?: boolean; rejected?: boolean }) {
  const color = rejected ? "bg-destructive" : done ? "bg-success" : "bg-muted-foreground/40";
  return (
    <li className="ml-5">
      <div className={`absolute -left-[7px] mt-1.5 h-3 w-3 rounded-full ${color} ring-4 ring-card`} />
      <div className="text-sm font-medium">{title}</div>
      <div className="text-xs text-muted-foreground">{who} · {when}</div>
      {comments && <div className="text-xs mt-1 italic text-muted-foreground">"{comments}"</div>}
    </li>
  );
}
