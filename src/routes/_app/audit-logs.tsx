import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/app-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { auditLogs } from "@/lib/mock-data";
import { formatDate } from "@/lib/format";
import { Search, Download } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useState } from "react";

export const Route = createFileRoute("/_app/audit-logs")({
  component: AuditLogsPage,
  head: () => ({ meta: [{ title: "Audit Logs — Meridian Pay" }] }),
});

function AuditLogsPage() {
  const [q, setQ] = useState("");
  const filtered = auditLogs.filter((l) => !q || `${l.user} ${l.action} ${l.entityId}`.toLowerCase().includes(q.toLowerCase()));
  return (
    <>
      <PageHeader title="Audit Logs" description="Immutable trail of every sensitive action across the portal." actions={<Button variant="outline" size="sm"><Download className="h-4 w-4" /> Export</Button>} />
      <Card className="border-border/70">
        <CardContent className="p-4">
          <div className="relative mb-4 max-w-sm">
            <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input className="pl-9" placeholder="Search user, action or entity…" value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
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
                {filtered.map((l) => (
                  <TableRow key={l.id}>
                    <TableCell className="text-xs text-muted-foreground whitespace-nowrap">{formatDate(l.timestamp)}</TableCell>
                    <TableCell className="text-sm">{l.user}</TableCell>
                    <TableCell><span className="text-xs font-mono px-2 py-0.5 rounded bg-secondary">{l.action}</span></TableCell>
                    <TableCell className="text-sm">{l.entity} · <span className="font-mono text-xs">{l.entityId}</span></TableCell>
                    <TableCell className="font-mono text-xs">{l.ipAddress}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{l.remarks ?? "—"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
