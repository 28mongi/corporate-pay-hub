import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/app-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { company } from "@/lib/mock-data";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/settings/company")({
  component: CompanySettings,
  head: () => ({ meta: [{ title: "Company Settings — Meridian Pay" }] }),
});

function CompanySettings() {
  return (
    <>
      <PageHeader title="Company Settings" description="Profile, security, and notification preferences for your company tenant." />
      <div className="grid lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2 border-border/70">
          <CardContent className="p-5 space-y-4">
            <div className="text-sm font-semibold">Company profile</div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1.5"><Label>Company name</Label><Input defaultValue={company.name} /></div>
              <div className="space-y-1.5"><Label>Code</Label><Input defaultValue={company.code} /></div>
              <div className="space-y-1.5"><Label>Country</Label><Input defaultValue={company.country} /></div>
              <div className="space-y-1.5"><Label>Default currency</Label><Input defaultValue="TZS" /></div>
            </div>
            <Button onClick={() => toast.success("Company profile updated")}>Save changes</Button>
          </CardContent>
        </Card>

        <Card className="border-border/70 h-fit">
          <CardContent className="p-5 space-y-4">
            <div className="text-sm font-semibold">Security & notifications</div>
            {[
              { k: "Enforce SSO via Keycloak", v: true },
              { k: "Require 2FA for approvers", v: true },
              { k: "Email notifications on approvals", v: true },
              { k: "Webhook callbacks to ERP", v: false },
            ].map((s) => (
              <div key={s.k} className="flex items-center justify-between">
                <span className="text-sm">{s.k}</span>
                <Switch defaultChecked={s.v} />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
