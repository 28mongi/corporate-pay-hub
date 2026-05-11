import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { PageHeader } from "@/components/app-layout";
import { Card, CardContent } from "@/components/ui/card";
import { dashboardApi } from "@/features/dashboard/api/dashboard-api";
import { formatMoney, formatDate, formatNumber } from "@/lib/format";
import { FileStack, Clock, CheckCircle2, AlertTriangle } from "lucide-react";
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid,
  PieChart, Pie, Cell, Legend,
} from "recharts";
import { CardSkeleton, ErrorState } from "@/components/data-states";

export const Route = createFileRoute("/_app/dashboard")({
  component: Dashboard,
  head: () => ({ meta: [{ title: "Dashboard — Corporate Pay Hub" }] }),
});

const STATUS_COLORS: Record<string, string> = {
  COMPLETED: "var(--success)",
  PENDING_APPROVAL: "var(--warning)",
  PROCESSING: "var(--info)",
  PARTIALLY_APPROVED: "var(--info)",
  FAILED: "var(--destructive)",
  REJECTED: "var(--destructive)",
  DRAFT: "var(--muted-foreground)",
};

function Stat({ label, value, hint, icon: Icon }: { label: string; value: string; hint?: string; icon: React.ElementType }) {
  return (
    <Card className="border-border/70">
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div>
            <div className="text-xs uppercase tracking-wider text-muted-foreground font-medium">{label}</div>
            <div className="text-2xl font-semibold tracking-tight mt-2">{value}</div>
            {hint && <div className="text-xs text-muted-foreground mt-1">{hint}</div>}
          </div>
          <div className="h-9 w-9 rounded-md bg-secondary flex items-center justify-center">
            <Icon className="h-4 w-4 text-primary" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function Dashboard() {
  const summary = useQuery({ queryKey: ["dashboard", "summary"], queryFn: dashboardApi.getDashboardSummary, retry: false });
  const statusMix = useQuery({ queryKey: ["dashboard", "status-summary"], queryFn: dashboardApi.getBatchStatusSummary, retry: false });
  const volume = useQuery({ queryKey: ["dashboard", "volume"], queryFn: dashboardApi.getPaymentVolume, retry: false });
  const recent = useQuery({ queryKey: ["dashboard", "recent"], queryFn: dashboardApi.getRecentActivity, retry: false });

  const anyError = summary.isError && statusMix.isError && volume.isError && recent.isError;

  if (anyError) {
    return (
      <>
        <PageHeader title="Operations Dashboard" />
        <ErrorState title="Dashboard data is currently unavailable." message="Please try again or contact support if the problem persists." onRetry={() => { summary.refetch(); statusMix.refetch(); volume.refetch(); recent.refetch(); }} />
      </>
    );
  }

  const s = summary.data;
  const currency = s?.currency ?? "TZS";
  const statusData = (statusMix.data ?? []).map((row) => ({
    name: String(row.status).replace(/_/g, " "),
    value: row.count,
    color: STATUS_COLORS[row.status as string] ?? "var(--muted-foreground)",
  }));

  return (
    <>
      <PageHeader title="Operations Dashboard" description="Live overview of corporate payment activity." />

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {summary.isLoading ? (
          <>
            <CardSkeleton /><CardSkeleton /><CardSkeleton /><CardSkeleton />
          </>
        ) : (
          <>
            <Stat label="Total Batches" value={formatNumber(s?.totalBatches ?? 0)} icon={FileStack} />
            <Stat label="Pending Approvals" value={formatNumber(s?.pendingApprovals ?? 0)} hint="Awaiting action" icon={Clock} />
            <Stat label="Processed Amount" value={formatMoney(s?.processedAmount ?? 0, currency)} icon={CheckCircle2} />
            <Stat label="Failed Transactions" value={formatNumber(s?.failedTransactions ?? 0)} icon={AlertTriangle} />
          </>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-6">
        <Card className="lg:col-span-2 border-border/70">
          <CardContent className="p-5">
            <div className="text-sm font-semibold">Processed vs Failed</div>
            <div className="text-xs text-muted-foreground">Daily payment volume</div>
            <div className="h-72 mt-4">
              {volume.isLoading ? (
                <div className="h-full bg-muted/30 rounded animate-pulse" />
              ) : volume.isError || !volume.data || volume.data.length === 0 ? (
                <div className="h-full flex items-center justify-center text-xs text-muted-foreground">
                  No payment volume data available.
                </div>
              ) : (
                <ResponsiveContainer>
                  <AreaChart data={volume.data} margin={{ left: -10, right: 8, top: 8 }}>
                    <defs>
                      <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="var(--accent)" stopOpacity={0.4} />
                        <stop offset="100%" stopColor="var(--accent)" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="g2" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="var(--destructive)" stopOpacity={0.3} />
                        <stop offset="100%" stopColor="var(--destructive)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="date" stroke="var(--muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
                    <YAxis stroke="var(--muted-foreground)" fontSize={11} tickLine={false} axisLine={false}
                      tickFormatter={(v) => `${(v / 1_000_000).toFixed(0)}M`} />
                    <Tooltip
                      contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }}
                      formatter={(v: number) => formatMoney(v, currency)}
                    />
                    <Area type="monotone" dataKey="processed" stroke="var(--accent)" fill="url(#g1)" strokeWidth={2} />
                    <Area type="monotone" dataKey="failed" stroke="var(--destructive)" fill="url(#g2)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/70">
          <CardContent className="p-5">
            <div className="text-sm font-semibold">Batch Status Mix</div>
            <div className="text-xs text-muted-foreground">All current batches</div>
            <div className="h-72">
              {statusMix.isLoading ? (
                <div className="h-full bg-muted/30 rounded animate-pulse" />
              ) : statusData.length === 0 ? (
                <div className="h-full flex items-center justify-center text-xs text-muted-foreground">No status data.</div>
              ) : (
                <ResponsiveContainer>
                  <PieChart>
                    <Pie data={statusData} dataKey="value" innerRadius={55} outerRadius={85} paddingAngle={3}>
                      {statusData.map((d, i) => <Cell key={i} fill={d.color} stroke="var(--card)" strokeWidth={2} />)}
                    </Pie>
                    <Legend iconType="circle" wrapperStyle={{ fontSize: 11 }} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6 border-border/70">
        <CardContent className="p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-sm font-semibold">Recent Activity</div>
              <div className="text-xs text-muted-foreground">Latest events</div>
            </div>
            <Link to="/batches" className="text-xs text-accent hover:underline">View batches →</Link>
          </div>
          {recent.isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-10 bg-muted/30 rounded animate-pulse" />)}
            </div>
          ) : !recent.data || recent.data.length === 0 ? (
            <div className="py-8 text-center text-xs text-muted-foreground">No recent activity.</div>
          ) : (
            <div className="divide-y divide-border">
              {recent.data.map((a) => (
                <div key={a.id} className="flex items-center justify-between py-3">
                  <div className="min-w-0">
                    <div className="text-sm font-medium truncate">{a.description}</div>
                    <div className="text-xs text-muted-foreground truncate">
                      {a.type}{a.reference ? ` · ${a.reference}` : ""}
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground">{formatDate(a.timestamp)}</div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
}
