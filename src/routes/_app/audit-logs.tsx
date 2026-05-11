import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { keepPreviousData } from "@tanstack/react-query";
import { PageHeader } from "@/components/app-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/format";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useState } from "react";
import { auditApi } from "@/features/audit/api/audit-api";
import { EmptyState, ErrorState, TableSkeleton } from "@/components/data-states";

export const Route = createFileRoute("/_app/audit-logs")({
  component: AuditLogsPage,
  head: () => ({ meta: [{ title: "Audit Logs — Corporate Pay Hub" }] }),
});

function AuditLogsPage() {
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [action, setAction] = useState("");
  const [username, setUsername] = useState("");
  const [entityType, setEntityType] = useState("");
  const [entityId, setEntityId] = useState("");
  const [page, setPage] = useState(0);
  const size = 20;

  const { data, isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: ["audit-logs", { page, size, fromDate, toDate, action, username, entityType, entityId }],
    queryFn: () => auditApi.getAuditLogs({
      page, size,
      fromDate: fromDate || undefined,
      toDate: toDate || undefined,
      action: action || undefined,
      username: username || undefined,
      entityType: entityType || undefined,
      entityId: entityId || undefined,
    }),
    placeholderData: keepPreviousData,
  });

  const rows = data?.content ?? [];
  const totalPages = data?.totalPages ?? 0;

  return (
    <>
      <PageHeader title="Audit Logs" description="Read-only trail of every sensitive action recorded by the backend." />
      <Card className="border-border/70">
        <CardContent className="p-4">
          <div className="grid sm:grid-cols-3 lg:grid-cols-6 gap-2 mb-4">
            <Input type="date" value={fromDate} onChange={(e) => { setFromDate(e.target.value); setPage(0); }} placeholder="From" />
            <Input type="date" value={toDate} onChange={(e) => { setToDate(e.target.value); setPage(0); }} placeholder="To" />
            <Input value={action} onChange={(e) => { setAction(e.target.value); setPage(0); }} placeholder="Action" />
            <Input value={username} onChange={(e) => { setUsername(e.target.value); setPage(0); }} placeholder="Username" />
            <Input value={entityType} onChange={(e) => { setEntityType(e.target.value); setPage(0); }} placeholder="Entity type" />
            <Input value={entityId} onChange={(e) => { setEntityId(e.target.value); setPage(0); }} placeholder="Entity ID" />
          </div>

          {isLoading ? <TableSkeleton rows={6} cols={6} /> :
            isError ? <ErrorState message={(error as Error)?.message} onRetry={() => refetch()} /> :
            rows.length === 0 ? <EmptyState title="No audit log entries" description="Try adjusting the filters above." /> :
            (
              <>
                <div className="border border-border rounded-md overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/40 hover:bg-muted/40">
                        <TableHead className="text-xs uppercase">Timestamp</TableHead>
                        <TableHead className="text-xs uppercase">User</TableHead>
                        <TableHead className="text-xs uppercase">Action</TableHead>
                        <TableHead className="text-xs uppercase">Entity</TableHead>
                        <TableHead className="text-xs uppercase">IP</TableHead>
                        <TableHead className="text-xs uppercase">Remarks</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {rows.map((l) => (
                        <TableRow key={l.id}>
                          <TableCell className="text-xs text-muted-foreground whitespace-nowrap">{formatDate(l.timestamp)}</TableCell>
                          <TableCell className="text-sm">{l.username}</TableCell>
                          <TableCell><span className="text-xs font-mono px-2 py-0.5 rounded bg-secondary">{l.action}</span></TableCell>
                          <TableCell className="text-sm">{l.entityType} · <span className="font-mono text-xs">{l.entityId}</span></TableCell>
                          <TableCell className="font-mono text-xs">{l.ipAddress ?? "—"}</TableCell>
                          <TableCell className="text-xs text-muted-foreground">{l.remarks ?? "—"}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                <div className="flex items-center justify-between mt-4 text-xs text-muted-foreground">
                  <div>{data?.totalElements ?? rows.length} entries{isFetching ? " · refreshing…" : ""}</div>
                  <div className="flex gap-2 items-center">
                    <Button variant="outline" size="sm" disabled={page === 0} onClick={() => setPage((p) => Math.max(0, p - 1))}>Prev</Button>
                    <span>Page {page + 1} of {Math.max(totalPages, 1)}</span>
                    <Button variant="outline" size="sm" disabled={page + 1 >= totalPages} onClick={() => setPage((p) => p + 1)}>Next</Button>
                  </div>
                </div>
              </>
            )}
        </CardContent>
      </Card>
    </>
  );
}
