import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeader } from "@/components/app-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { batches } from "@/lib/mock-data";
import { StatusBadge } from "@/components/status-badge";
import { formatMoney, formatDate } from "@/lib/format";
import { useMemo, useState } from "react";
import { Plus, Search, Download } from "lucide-react";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  flexRender, getCoreRowModel, getPaginationRowModel, getSortedRowModel,
  useReactTable, type ColumnDef, type SortingState,
} from "@tanstack/react-table";
import type { PaymentBatch } from "@/lib/types";

export const Route = createFileRoute("/_app/batches/")({
  component: BatchesList,
  head: () => ({ meta: [{ title: "Payment Batches — Meridian Pay" }] }),
});

const columns: ColumnDef<PaymentBatch>[] = [
  {
    accessorKey: "reference",
    header: "Reference",
    cell: ({ row }) => (
      <Link to="/batches/$batchId" params={{ batchId: row.original.id }} className="font-medium hover:text-accent">
        {row.original.reference}
      </Link>
    ),
  },
  { accessorKey: "fileName", header: "File", cell: ({ row }) => <span className="text-muted-foreground">{row.original.fileName}</span> },
  { accessorKey: "type", header: "Type", cell: ({ row }) => <span className="text-xs font-medium px-2 py-0.5 rounded bg-secondary">{row.original.type}</span> },
  { accessorKey: "totalRecords", header: () => <div className="text-right">Records</div>, cell: ({ row }) => <div className="text-right tabular-nums">{row.original.totalRecords}</div> },
  { accessorKey: "totalAmount", header: () => <div className="text-right">Amount</div>, cell: ({ row }) => <div className="text-right tabular-nums font-medium">{formatMoney(row.original.totalAmount, row.original.currency)}</div> },
  { accessorKey: "status", header: "Status", cell: ({ row }) => <StatusBadge status={row.original.status} /> },
  { accessorKey: "createdBy", header: "Created by" },
  { accessorKey: "createdAt", header: "Created", cell: ({ row }) => <span className="text-muted-foreground text-xs">{formatDate(row.original.createdAt)}</span> },
];

function BatchesList() {
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<string>("ALL");
  const [type, setType] = useState<string>("ALL");
  const [sorting, setSorting] = useState<SortingState>([]);

  const data = useMemo(() => batches.filter((b) => {
    if (status !== "ALL" && b.status !== status) return false;
    if (type !== "ALL" && b.type !== type) return false;
    if (q && !`${b.reference} ${b.fileName} ${b.createdBy}`.toLowerCase().includes(q.toLowerCase())) return false;
    return true;
  }), [q, status, type]);

  const table = useReactTable({
    data, columns, state: { sorting }, onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 10 } },
  });

  return (
    <>
      <PageHeader
        title="Payment Batches"
        description="All payment batches submitted by your company."
        actions={
          <>
            <Button variant="outline" size="sm"><Download className="h-4 w-4" /> Export</Button>
            <Button asChild size="sm"><Link to="/batches/upload"><Plus className="h-4 w-4" /> New Batch</Link></Button>
          </>
        }
      />
      <Card className="border-border/70">
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-2 items-center mb-4">
            <div className="relative flex-1 min-w-[220px]">
              <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search reference, file or creator…" className="pl-9" />
            </div>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="w-[200px]"><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All statuses</SelectItem>
                {["DRAFT","PENDING_APPROVAL","PARTIALLY_APPROVED","APPROVED","REJECTED","PROCESSING","COMPLETED","PARTIALLY_COMPLETED","FAILED","CANCELLED"].map((s) => (
                  <SelectItem key={s} value={s}>{s.replace(/_/g, " ")}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger className="w-[140px]"><SelectValue placeholder="Type" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All types</SelectItem>
                {["INTERNAL","RTGS","TIPS","GEPG"].map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div className="border border-border rounded-md overflow-hidden">
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((hg) => (
                  <TableRow key={hg.id} className="bg-muted/40 hover:bg-muted/40">
                    {hg.headers.map((h) => (
                      <TableHead key={h.id} className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        {flexRender(h.column.columnDef.header, h.getContext())}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows.length === 0 ? (
                  <TableRow><TableCell colSpan={columns.length} className="h-32 text-center text-muted-foreground">No batches match your filters.</TableCell></TableRow>
                ) : table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id}>
                    {row.getVisibleCells().map((c) => (
                      <TableCell key={c.id}>{flexRender(c.column.columnDef.cell, c.getContext())}</TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="flex items-center justify-between mt-4 text-xs text-muted-foreground">
            <div>{table.getFilteredRowModel().rows.length} batches</div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>Prev</Button>
              <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>Next</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
