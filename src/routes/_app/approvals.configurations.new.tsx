import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { PageHeader } from "@/components/app-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { users } from "@/lib/mock-data";
import { useState } from "react";
import { Plus, Trash2, ChevronLeft } from "lucide-react";
import { toast } from "sonner";
import { Link } from "@tanstack/react-router";

export const Route = createFileRoute("/_app/approvals/configurations/new")({
  component: NewMatrix,
  head: () => ({ meta: [{ title: "New Approval Matrix — Meridian Pay" }] }),
});

interface DraftLevel { name: string; approverIds: string[]; required: number; min?: number; max?: number; }

function NewMatrix() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [paymentType, setPaymentType] = useState("ALL");
  const [levels, setLevels] = useState<DraftLevel[]>([{ name: "Checker", approverIds: [], required: 1 }]);

  const updateLevel = (i: number, patch: Partial<DraftLevel>) =>
    setLevels((ls) => ls.map((l, idx) => idx === i ? { ...l, ...patch } : l));

  const eligible = users.filter((u) => u.active && (u.roles.includes("CHECKER") || u.roles.includes("APPROVER") || u.roles.includes("COMPANY_ADMIN")));

  return (
    <>
      <Link to="/approvals/configurations" className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground mb-3">
        <ChevronLeft className="h-3.5 w-3.5" /> Back to configurations
      </Link>
      <PageHeader title="New Approval Matrix" description="Configure sequential levels, approvers, and amount thresholds." />

      <div className="grid lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2 border-border/70">
          <CardContent className="p-5 space-y-5">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Matrix name</Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Standard Payments" />
              </div>
              <div className="space-y-1.5">
                <Label>Applies to</Label>
                <Select value={paymentType} onValueChange={setPaymentType}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All payment types</SelectItem>
                    {["INTERNAL","RTGS","TIPS","GEPG"].map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm">Approval levels</Label>
                <Button variant="outline" size="sm" onClick={() => setLevels((ls) => [...ls, { name: `Level ${ls.length + 1}`, approverIds: [], required: 1 }])}>
                  <Plus className="h-4 w-4" /> Add level
                </Button>
              </div>
              {levels.map((lvl, i) => (
                <div key={i} className="border border-border rounded-md p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-7 w-7 rounded-full bg-primary text-primary-foreground text-xs font-semibold flex items-center justify-center">L{i + 1}</div>
                      <Input value={lvl.name} onChange={(e) => updateLevel(i, { name: e.target.value })} className="h-8 w-56" />
                    </div>
                    {levels.length > 1 && (
                      <Button variant="ghost" size="icon" onClick={() => setLevels((ls) => ls.filter((_, idx) => idx !== i))}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    )}
                  </div>
                  <div className="grid sm:grid-cols-3 gap-3">
                    <div className="space-y-1.5">
                      <Label className="text-xs">Required approvals</Label>
                      <Input type="number" min={1} value={lvl.required} onChange={(e) => updateLevel(i, { required: parseInt(e.target.value) || 1 })} />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Min amount</Label>
                      <Input type="number" placeholder="Any" value={lvl.min ?? ""} onChange={(e) => updateLevel(i, { min: e.target.value ? +e.target.value : undefined })} />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Max amount</Label>
                      <Input type="number" placeholder="Any" value={lvl.max ?? ""} onChange={(e) => updateLevel(i, { max: e.target.value ? +e.target.value : undefined })} />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Eligible approvers</Label>
                    <div className="grid sm:grid-cols-2 gap-2">
                      {eligible.map((u) => {
                        const checked = lvl.approverIds.includes(u.id);
                        return (
                          <label key={u.id} className="flex items-center gap-2 border border-border rounded-md px-3 py-2 cursor-pointer hover:bg-muted/40">
                            <Checkbox checked={checked} onCheckedChange={(c) => updateLevel(i, {
                              approverIds: c ? [...lvl.approverIds, u.id] : lvl.approverIds.filter((id) => id !== u.id),
                            })} />
                            <div className="min-w-0">
                              <div className="text-sm truncate">{u.fullName}</div>
                              <div className="text-[11px] text-muted-foreground truncate">{u.roles.join(", ")}</div>
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/70 h-fit">
          <CardContent className="p-5 space-y-3">
            <div className="text-sm font-semibold">Preview</div>
            <div className="text-xs text-muted-foreground">Sequential flow that will be enforced for matching batches.</div>
            <ol className="space-y-2 mt-3">
              {levels.map((l, i) => (
                <li key={i} className="flex items-center gap-2 text-sm">
                  <span className="h-6 w-6 rounded-full bg-secondary text-xs flex items-center justify-center">{i + 1}</span>
                  <span className="font-medium">{l.name || `Level ${i + 1}`}</span>
                  <span className="text-muted-foreground text-xs">· {l.approverIds.length} approver(s)</span>
                </li>
              ))}
            </ol>
            <Button className="w-full mt-3" onClick={() => { toast.success("Matrix saved"); navigate({ to: "/approvals/configurations" }); }}>
              Save matrix
            </Button>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
