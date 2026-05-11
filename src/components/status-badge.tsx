import { Badge } from "@/components/ui/badge";
import type { BatchStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

const styles: Record<string, string> = {
  DRAFT: "bg-muted text-muted-foreground border-border",
  VALIDATION_FAILED: "bg-destructive/10 text-destructive border-destructive/20",
  PENDING_APPROVAL: "bg-warning/15 text-warning-foreground border-warning/30",
  PARTIALLY_APPROVED: "bg-info/15 text-info border-info/30",
  APPROVED: "bg-success/15 text-success border-success/30",
  REJECTED: "bg-destructive/10 text-destructive border-destructive/20",
  RETURNED_FOR_CORRECTION: "bg-warning/15 text-warning-foreground border-warning/30",
  SUBMITTED_FOR_PROCESSING: "bg-info/15 text-info border-info/30",
  PROCESSING: "bg-info/15 text-info border-info/30",
  COMPLETED: "bg-success/15 text-success border-success/30",
  PARTIALLY_COMPLETED: "bg-warning/15 text-warning-foreground border-warning/30",
  FAILED: "bg-destructive/10 text-destructive border-destructive/20",
  CANCELLED: "bg-muted text-muted-foreground border-border",
};

export function StatusBadge({ status }: { status: BatchStatus | string }) {
  const cls = styles[status] ?? "bg-muted text-muted-foreground border-border";
  return (
    <Badge variant="outline" className={cn("font-medium tracking-tight", cls)}>
      <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-current opacity-80" />
      {String(status).replace(/_/g, " ")}
    </Badge>
  );
}
