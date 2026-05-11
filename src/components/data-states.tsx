import { Card, CardContent } from "@/components/ui/card";
import { Inbox, AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export function EmptyState({ title, description, icon: Icon = Inbox }: { title: string; description?: string; icon?: React.ElementType }) {
  return (
    <Card className="border-border/70">
      <CardContent className="p-12 text-center">
        <div className="mx-auto h-12 w-12 rounded-full bg-secondary flex items-center justify-center">
          <Icon className="h-6 w-6 text-muted-foreground" />
        </div>
        <div className="mt-4 text-sm font-semibold">{title}</div>
        {description && <div className="mt-1.5 text-xs text-muted-foreground max-w-sm mx-auto">{description}</div>}
      </CardContent>
    </Card>
  );
}

export function ErrorState({ title = "Couldn't load data", message, onRetry }: { title?: string; message?: string; onRetry?: () => void }) {
  return (
    <Card className="border-destructive/30">
      <CardContent className="p-10 text-center">
        <div className="mx-auto h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center">
          <AlertTriangle className="h-6 w-6 text-destructive" />
        </div>
        <div className="mt-4 text-sm font-semibold">{title}</div>
        {message && <div className="mt-1.5 text-xs text-muted-foreground max-w-md mx-auto">{message}</div>}
        {onRetry && (
          <Button size="sm" variant="outline" className="mt-5" onClick={onRetry}>
            <RefreshCw className="h-3.5 w-3.5" /> Try again
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

export function TableSkeleton({ rows = 6, cols = 6 }: { rows?: number; cols?: number }) {
  return (
    <div className="border border-border rounded-md overflow-hidden">
      <div className="bg-muted/40 h-9 border-b border-border" />
      <div className="divide-y divide-border">
        {Array.from({ length: rows }).map((_, r) => (
          <div key={r} className="flex items-center gap-4 px-4 py-3">
            {Array.from({ length: cols }).map((__, c) => (
              <div key={c} className="h-3 bg-muted rounded animate-pulse flex-1" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export function CardSkeleton({ className = "" }: { className?: string }) {
  return <div className={`h-28 bg-muted/40 border border-border/60 rounded-md animate-pulse ${className}`} />;
}
