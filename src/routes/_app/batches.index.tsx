import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { keepPreviousData } from "@tanstack/react-query";
import { PageHeader } from "@/components/app-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { StatusBadge } from "@/components/status-badge";
import { formatMoney, formatDate } from "@/lib/format";
import { useState } from "react";
import { Plus, Search } from "lucide-react";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { batchApi } from "@/features/batches/api/batch-api";
import { EmptyState, ErrorState, TableSkeleton } from "@/components/data-states";

export const Route = createFileRoute("/_app/batches/")({
  component: BatchesList,
  head: () => ({ meta: [{ title: "Payment Batches — Corporate Pay Hub" }] }),
});

const STATUS_OPTIONS = [
  "DRAFT","PENDING_APPROVAL","PARTIALLY_APPROVED","APPROVED","REJECTED",
  "RETURNED_FOR_CORRECTION","SUBMITTED_FOR_PROCESSING","PROCESSING","COMPLETED",
  "PARTIALLY_COMPLETED","FAILED","CANCELLED",
];

function BatchesList() {
  const [batchNo, setBatchNo] = useState("");
  const [status, setStatus] = useState<string>("ALL");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [page, setPage] = useState(0);
  const size = 10;

  const { data, isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: ["batches", { page, size, status, batchNo, fromDate, toDate }],
    queryFn: () => batchApi.getBatches({
      page, size,
      status: status === "ALL" ? undefined : status,
      batchNo: batchNo || undefined,
      fromDate: fromDate || undefined,
      toDate: toDate || undefined,
    }),
    placeholderData: keepPreviousData,
  });

  const rows = data?.content ?? [];
  const totalPages = data?.totalPages ?? 0;
  const totalElements = data?.totalElements ?? 0;

  return (
    <>
      <PageHeader
        title="Payment Batches"
        description="All payment batches submitted by your company."
        actions={
          <Button asChild size="sm"><Link to="/batches/upload"><Plus className="h-4 w-4" /> New batch</Link></Button>
        }
      />
      <Card className="border-border/70">
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-2 items-center mb-4">
            <div className="relative flex-1 min-w-[220px]">
              <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={batchNo}
                onChange={(e) => { setBatchNo(e.target.value); setPage(0); }}
                placeholder="Search by batch number…"
                className="pl-9"
              />
            </div>
            <Select value={status} onValueChange={(v) => { setStatus(v); setPage(0); }}>
              <SelectTrigger className="w-[210px]"><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All statuses</SelectItem>
                {STATUS_OPTIONS.map((s) => (
                  <SelectItem key={s} value={s}>{s.replace(/_/g, " ")}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input type="date" value={fromDate} onChange={(e) => { setFromDate(e.target.value); setPage(0); }} className="w-[160px]" />
            <Input type="date" value={toDate} onChange={(e) => { setToDate(e.target.value); setPage(0); }} className="w-[160px]" />
          </div>

          {isLoading ? (
            <TableSkeleton rows={8} cols={7} />
          ) : isError ? (
            <ErrorState message={(error as Error)?.message} onRetry={() => refetch()} />
          ) : rows.length === 0 ? (
            <EmptyState title="No batches found" description="No batches match your current filters." />
          ) : (
            <>
              <div className="border border-border rounded-md overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/40 hover:bg-muted/40">
                      <TableHead className="text-xs uppercase">Batch No</TableHead>
                      <TableHead className="text-xs uppercase">Debit Account</TableHead>
                      <TableHead className="text-xs uppercase text-right">Records</TableHead>
                      <TableHead className="text-xs uppercase text-right">Amount</TableHead>
                      <TableHead className="text-xs uppercase">Status</TableHead>
                      <TableHead className="text-xs uppercase">Created by</TableHead>
                      <TableHead className="text-xs uppercase">Created</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rows.map((b) => (
                      <TableRow key={b.id}>
                        <TableCell>
                          <Link to="/batches/$batchId" params={{ batchId: b.id }} className="font-medium hover:text-accent">
                            {b.batchNo}
                          </Link>
                        </TableCell>
                        <TableCell className="font-mono text-xs">{b.debitAccount ?? "—"}</TableCell>
                        <TableCell className="text-right tabular-nums">{b.totalRecords}</TableCell>
                        <TableCell className="text-right tabular-nums font-medium">
                          {formatMoney(b.totalAmount, b.currency)}
                        </TableCell>
                        <TableCell><StatusBadge status={b.status} /></TableCell>
                        <TableCell className="text-sm">{b.createdBy ?? "—"}</TableCell>
                        <TableCell className="text-xs text-muted-foreground">{formatDate(b.createdAt)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <div className="flex items-center justify-between mt-4 text-xs text-muted-foreground">
                <div>{totalElements} batches{isFetching ? " · refreshing…" : ""}</div>
                <div className="flex gap-2 items-center">
                  <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(0, p - 1))} disabled={page === 0}>Prev</Button>
                  <span>Page {page + 1} of {Math.max(totalPages, 1)}</span>
                  <Button variant="outline" size="sm" onClick={() => setPage((p) => p + 1)} disabled={page + 1 >= totalPages}>Next</Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </>
  );
}
