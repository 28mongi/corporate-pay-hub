import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { PageHeader } from "@/components/app-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { Plus, Trash2, ChevronLeft } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { approvalConfigApi } from "@/features/approvals/api/approval-config-api";
import { useSession } from "@/features/session/session-context";
import type { ApprovalConfigLevel } from "@/lib/types";

export const Route = createFileRoute("/_app/approvals/configurations/new")({
  component: NewConfig,
  head: () => ({ meta: [{ title: "New Approval Configuration — Corporate Pay Hub" }] }),
});

interface DraftLevel {
  levelName: string;
  requiredApprovals: number;
  userIdsRaw: string;
}

const schema = z.object({
  name: z.string().min(1, "Name is required"),
  minAmount: z.number().min(0, "Min amount must be ≥ 0"),
  maxAmount: z.number().positive("Max amount must be > 0"),
  levels: z.array(z.object({
    levelName: z.string().min(1, "Level name is required"),
    requiredApprovals: z.number().int().min(1, "Required approvals must be ≥ 1"),
    userIds: z.array(z.string().min(1)).min(1, "At least one approver user ID is required"),
  })).min(1, "At least one level is required"),
}).refine((d) => d.maxAmount > d.minAmount, { message: "Max amount must be greater than min amount", path: ["maxAmount"] });

function NewConfig() {
  const navigate = useNavigate();
  const session = useSession();
  const qc = useQueryClient();
  const [name, setName] = useState("");
  const [minAmount, setMinAmount] = useState<string>("0");
  const [maxAmount, setMaxAmount] = useState<string>("");
  const [levels, setLevels] = useState<DraftLevel[]>([
    { levelName: "Checker", requiredApprovals: 1, userIdsRaw: "" },
  ]);
  const [errors, setErrors] = useState<string[]>([]);

  const updateLevel = (i: number, patch: Partial<DraftLevel>) =>
    setLevels((ls) => ls.map((l, idx) => idx === i ? { ...l, ...patch } : l));

  const createMut = useMutation({
    mutationFn: approvalConfigApi.createApprovalConfig,
    onSuccess: () => {
      toast.success("Configuration created");
      qc.invalidateQueries({ queryKey: ["approval-configs"] });
      navigate({ to: "/approvals/configurations" });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const handleSave = () => {
    const parsedLevels: ApprovalConfigLevel[] = levels.map((l, i) => ({
      levelNumber: i + 1,
      levelName: l.levelName,
      requiredApprovals: l.requiredApprovals,
      userIds: l.userIdsRaw.split(",").map((s) => s.trim()).filter(Boolean),
    }));
    const result = schema.safeParse({
      name: name.trim(),
      minAmount: Number(minAmount),
      maxAmount: Number(maxAmount),
      levels: parsedLevels,
    });
    if (!result.success) {
      const msgs = result.error.issues.map((i) => i.message);
      setErrors(msgs);
      toast.error(msgs[0]);
      return;
    }
    setErrors([]);
    if (!session.companyId) {
      toast.error("Session is missing companyId. Cannot create configuration.");
      return;
    }
    createMut.mutate({
      companyId: session.companyId,
      name: result.data.name,
      minAmount: result.data.minAmount,
      maxAmount: result.data.maxAmount,
      levels: result.data.levels,
    });
  };

  return (
    <>
      <Link to="/approvals/configurations" className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground mb-3">
        <ChevronLeft className="h-3.5 w-3.5" /> Back to configurations
      </Link>
      <PageHeader title="New Approval Configuration" description="Define sequential levels, required approvals, and amount range." />

      <div className="grid lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2 border-border/70">
          <CardContent className="p-5 space-y-5">
            <div className="grid sm:grid-cols-3 gap-4">
              <div className="space-y-1.5 sm:col-span-3">
                <Label>Name</Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Standard Payments" />
              </div>
              <div className="space-y-1.5">
                <Label>Min amount</Label>
                <Input type="number" min={0} value={minAmount} onChange={(e) => setMinAmount(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>Max amount</Label>
                <Input type="number" min={0} value={maxAmount} onChange={(e) => setMaxAmount(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>Company</Label>
                <Input value={session.companyName ?? session.companyId ?? ""} disabled />
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm">Approval levels</Label>
                <Button variant="outline" size="sm" onClick={() => setLevels((ls) => [...ls, { levelName: `Level ${ls.length + 1}`, requiredApprovals: 1, userIdsRaw: "" }])}>
                  <Plus className="h-4 w-4" /> Add level
                </Button>
              </div>
              {levels.map((lvl, i) => (
                <div key={i} className="border border-border rounded-md p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-7 w-7 rounded-full bg-primary text-primary-foreground text-xs font-semibold flex items-center justify-center">L{i + 1}</div>
                      <Input value={lvl.levelName} onChange={(e) => updateLevel(i, { levelName: e.target.value })} className="h-8 w-56" />
                    </div>
                    {levels.length > 1 && (
                      <Button variant="ghost" size="icon" onClick={() => setLevels((ls) => ls.filter((_, idx) => idx !== i))}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    )}
                  </div>
                  <div className="grid sm:grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label className="text-xs">Required approvals</Label>
                      <Input type="number" min={1} value={lvl.requiredApprovals}
                        onChange={(e) => updateLevel(i, { requiredApprovals: parseInt(e.target.value) || 1 })} />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Approver user IDs (comma-separated)</Label>
                    <Textarea
                      rows={2}
                      placeholder="e.g. user-001, user-042, user-117"
                      value={lvl.userIdsRaw}
                      onChange={(e) => updateLevel(i, { userIdsRaw: e.target.value })}
                    />
                    <p className="text-[11px] text-muted-foreground">
                      Enter the user IDs from the parent system. User management is handled outside this portal.
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {errors.length > 0 && (
              <div className="rounded-md border border-destructive/30 bg-destructive/5 p-3 text-xs text-destructive space-y-1">
                {errors.map((e, i) => <div key={i}>• {e}</div>)}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-border/70 h-fit">
          <CardContent className="p-5 space-y-3">
            <div className="text-sm font-semibold">Preview</div>
            <ol className="space-y-2 mt-3">
              {levels.map((l, i) => (
                <li key={i} className="flex items-center gap-2 text-sm">
                  <span className="h-6 w-6 rounded-full bg-secondary text-xs flex items-center justify-center">{i + 1}</span>
                  <span className="font-medium">{l.levelName || `Level ${i + 1}`}</span>
                  <span className="text-muted-foreground text-xs">
                    · {l.userIdsRaw.split(",").map((s) => s.trim()).filter(Boolean).length} approver(s)
                  </span>
                </li>
              ))}
            </ol>
            <Button className="w-full mt-3" disabled={createMut.isPending} onClick={handleSave}>
              {createMut.isPending ? "Saving…" : "Save configuration"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
