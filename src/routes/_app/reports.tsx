import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/app-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileBarChart2, Download } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/reports")({
  component: Reports,
  head: () => ({ meta: [{ title: "Reports — Meridian Pay" }] }),
});

const reports = [
  { id: "batch-processing", name: "Batch Processing Report", desc: "Detailed batch outcomes including processed, failed and pending items." },
  { id: "failed-tx", name: "Failed Transactions Report", desc: "All payment transactions that failed, grouped by failure reason." },
  { id: "approval", name: "Approval Report", desc: "Approval activity per level, approver and turnaround time." },
  { id: "user-activity", name: "User Activity Report", desc: "Sign-ins, sensitive actions and configuration changes per user." },
];

function Reports() {
  return (
    <>
      <PageHeader title="Reports" description="Generate operational and compliance reports. Export to CSV or Excel." />
      <div className="grid sm:grid-cols-2 gap-4">
        {reports.map((r) => (
          <Card key={r.id} className="border-border/70">
            <CardContent className="p-5 flex items-start gap-4">
              <div className="h-10 w-10 rounded-md bg-secondary flex items-center justify-center"><FileBarChart2 className="h-5 w-5 text-primary" /></div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold">{r.name}</div>
                <div className="text-xs text-muted-foreground mt-1">{r.desc}</div>
                <div className="flex gap-2 mt-3">
                  <Button size="sm" variant="outline" onClick={() => toast.success(`${r.name} (CSV) generated`)}><Download className="h-4 w-4" /> CSV</Button>
                  <Button size="sm" variant="outline" onClick={() => toast.success(`${r.name} (Excel) generated`)}><Download className="h-4 w-4" /> Excel</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  );
}
