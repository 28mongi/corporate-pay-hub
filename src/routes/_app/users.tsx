import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/app-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { users } from "@/lib/mock-data";
import { formatDate } from "@/lib/format";
import { Plus, Power } from "lucide-react";
import { toast } from "sonner";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export const Route = createFileRoute("/_app/users")({
  component: UsersPage,
  head: () => ({ meta: [{ title: "Users & Roles — Meridian Pay" }] }),
});

function UsersPage() {
  return (
    <>
      <PageHeader title="Users & Roles" description="Manage company users and their access levels." actions={<Button size="sm"><Plus className="h-4 w-4" /> Invite user</Button>} />
      <Card className="border-border/70">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40 hover:bg-muted/40">
                <TableHead className="text-xs uppercase">User</TableHead>
                <TableHead className="text-xs uppercase">Roles</TableHead>
                <TableHead className="text-xs uppercase">Status</TableHead>
                <TableHead className="text-xs uppercase">Last sign-in</TableHead>
                <TableHead className="text-xs uppercase text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((u) => {
                const initials = u.fullName.split(" ").map((s) => s[0]).slice(0, 2).join("");
                return (
                  <TableRow key={u.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground text-xs font-semibold flex items-center justify-center">{initials}</div>
                        <div>
                          <div className="text-sm font-medium">{u.fullName}</div>
                          <div className="text-xs text-muted-foreground">{u.email}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {u.roles.map((r) => <Badge key={r} variant="outline" className="font-normal">{r}</Badge>)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center gap-1.5 text-xs ${u.active ? "text-success" : "text-muted-foreground"}`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${u.active ? "bg-success" : "bg-muted-foreground"}`} />
                        {u.active ? "Active" : "Inactive"}
                      </span>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">{u.lastLoginAt ? formatDate(u.lastLoginAt) : "Never"}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" onClick={() => toast.info(`${u.active ? "Deactivated" : "Activated"} ${u.fullName}`)}>
                        <Power className="h-4 w-4" /> {u.active ? "Deactivate" : "Activate"}
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </>
  );
}
