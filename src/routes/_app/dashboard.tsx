import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/app-layout";
import { Card, CardContent } from "@/components/ui/card";
import { batches } from "@/lib/mock-data";
import { formatMoney } from "@/lib/format";
import { StatusBadge } from "@/components/status-badge";
import { ArrowUpRight, ArrowDownRight, FileStack, Clock, CheckCircle2, AlertTriangle, Hourglass } from "lucide-react";
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid,
  PieChart, Pie, Cell, Legend,
} from "recharts";
import { Link } from "@tanstack/react-router";

export const Route = createFileRoute("/_app/dashboard")({
  component: Dashboard,
  head: () => ({ meta: [{ title: "Dashboard — Meridian Pay" }] }),
});

const trend = [
  { d: "Mon", processed: 4_200_000, failed: 120_000 },
  { d: "Tue", processed: 6_800_000, failed: 80_000 },
  { d: "Wed", processed: 5_400_000, failed: 200_000 },
  { d: "Thu", processed: 9_100_000, failed: 60_000 },
  { d: "Fri", processed: 12_400_000, failed: 340_000 },
  { d: "Sat", processed: 3_900_000, failed: 0 },
  { d: "Sun", processed: 2_100_000, failed: 0 },
];

const statusData = [
  { name: "Completed", value: 62, color: "var(--success)" },
  { name: "Pending", value: 18, color: "var(--warning)" },
  { name: "Processing", value: 12, color: "var(--info)" },
  { name: "Failed", value: 8, color: "var(--destructive)" },
];

function Stat({ label, value, hint, icon: Icon, delta, positive }: {
  label: string; value: string; hint?: string; icon: React.ElementType; delta?: string; positive?: boolean;
}) {
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
        {delta && (
          <div className={`mt-3 inline-flex items-center gap-1 text-xs ${positive ? "text-success" : "text-destructive"}`}>
            {positive ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />} {delta}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function Dashboard() {
  const recent = batches.slice(0, 5);
  return (
    <>
      <PageHeader title="Operations Dashboard" description="Real-time overview of your corporate payment activity." />

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4">
        <Stat label="Total Batches" value="142" hint="Last 30 days" icon={FileStack} delta="+12.4%" positive />
        <Stat label="Pending Approvals" value="9" hint="Requires action" icon={Clock} delta="+3 today" />
        <Stat label="Processed Amount" value={formatMoney(184_320_000)} hint="This month" icon={CheckCircle2} delta="+8.1%" positive />
        <Stat label="Failed Transactions" value="23" hint="Last 7 days" icon={AlertTriangle} delta="-1.2%" positive />
        <Stat label="Pending Callbacks" value="4" hint="Provider pending" icon={Hourglass} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-6">
        <Card className="lg:col-span-2 border-border/70">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="text-sm font-semibold">Processed vs Failed</div>
                <div className="text-xs text-muted-foreground">Daily volume — last 7 days</div>
              </div>
            </div>
            <div className="h-72">
              <ResponsiveContainer>
                <AreaChart data={trend} margin={{ left: -10, right: 8, top: 8 }}>
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
                  <XAxis dataKey="d" stroke="var(--muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="var(--muted-foreground)" fontSize={11} tickLine={false} axisLine={false}
                    tickFormatter={(v) => `${(v / 1_000_000).toFixed(0)}M`} />
                  <Tooltip
                    contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }}
                    formatter={(v: number) => formatMoney(v)}
                  />
                  <Area type="monotone" dataKey="processed" stroke="var(--accent)" fill="url(#g1)" strokeWidth={2} />
                  <Area type="monotone" dataKey="failed" stroke="var(--destructive)" fill="url(#g2)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/70">
          <CardContent className="p-5">
            <div className="text-sm font-semibold">Payment Status Mix</div>
            <div className="text-xs text-muted-foreground">Across all batches</div>
            <div className="h-72">
              <ResponsiveContainer>
                <PieChart>
                  <Pie data={statusData} dataKey="value" innerRadius={55} outerRadius={85} paddingAngle={3}>
                    {statusData.map((s) => <Cell key={s.name} fill={s.color} stroke="var(--card)" strokeWidth={2} />)}
                  </Pie>
                  <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6 border-border/70">
        <CardContent className="p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-sm font-semibold">Recent Activity</div>
              <div className="text-xs text-muted-foreground">Latest batches across the company</div>
            </div>
            <Link to="/batches" className="text-xs text-accent hover:underline">View all →</Link>
          </div>
          <div className="divide-y divide-border">
            {recent.map((b) => (
              <Link key={b.id} to="/batches/$batchId" params={{ batchId: b.id }}
                className="flex items-center justify-between py-3 hover:bg-muted/40 -mx-2 px-2 rounded">
                <div className="min-w-0">
                  <div className="text-sm font-medium truncate">{b.reference}</div>
                  <div className="text-xs text-muted-foreground truncate">{b.fileName} · by {b.createdBy}</div>
                </div>
                <div className="hidden md:block text-sm tabular-nums">{formatMoney(b.totalAmount)}</div>
                <StatusBadge status={b.status} />
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>
    </>
  );
}
