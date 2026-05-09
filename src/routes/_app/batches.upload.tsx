import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { PageHeader } from "@/components/app-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useCallback, useState } from "react";
import { UploadCloud, FileSpreadsheet, CheckCircle2, AlertCircle, X } from "lucide-react";
import { formatMoney } from "@/lib/format";
import { toast } from "sonner";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";

export const Route = createFileRoute("/_app/batches/upload")({
  component: UploadBatch,
  head: () => ({ meta: [{ title: "Upload Batch — Meridian Pay" }] }),
});

const previewItems = [
  { ref: "REF00001", name: "Jane Doe", account: "0123456789", bank: "CRDB", amount: 250_000, valid: true },
  { ref: "REF00002", name: "ACME Supplies", account: "0987654321", bank: "NMB", amount: 1_400_000, valid: true },
  { ref: "REF00003", name: "Kibo Foods", account: "0234567890", bank: "NBC", amount: 78_500, valid: true },
  { ref: "REF00004", name: "John Smith", account: "01XXX", bank: "STAN", amount: 12_000, valid: false, reason: "Invalid account format" },
  { ref: "REF00002", name: "ACME Supplies", account: "0987654321", bank: "NMB", amount: 1_400_000, valid: false, reason: "Duplicate reference" },
  { ref: "REF00006", name: "Zawadi Traders", account: "0345678901", bank: "EQTY", amount: 540_000, valid: true },
];

function UploadBatch() {
  const navigate = useNavigate();
  const [file, setFile] = useState<File | null>(null);
  const [drag, setDrag] = useState(false);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setDrag(false);
    const f = e.dataTransfer.files?.[0]; if (f) setFile(f);
  }, []);

  const total = previewItems.reduce((s, i) => s + i.amount, 0);
  const validCount = previewItems.filter((i) => i.valid).length;
  const invalidCount = previewItems.length - validCount;

  return (
    <>
      <PageHeader title="Upload Payment Batch" description="Upload a CSV or Excel file. We will validate every record before submission." />

      <div className="grid lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2 border-border/70">
          <CardContent className="p-5">
            <div className="text-sm font-semibold mb-3">1. Source file</div>
            <div
              onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
              onDragLeave={() => setDrag(false)}
              onDrop={onDrop}
              className={`border-2 border-dashed rounded-lg p-10 text-center transition-colors ${drag ? "border-accent bg-accent/5" : "border-border"}`}
            >
              {!file ? (
                <>
                  <div className="mx-auto h-12 w-12 rounded-full bg-secondary flex items-center justify-center">
                    <UploadCloud className="h-6 w-6 text-primary" />
                  </div>
                  <div className="mt-4 text-sm font-medium">Drop file here or click to browse</div>
                  <div className="text-xs text-muted-foreground mt-1">CSV, XLS or XLSX · max 20MB · up to 10,000 rows</div>
                  <label className="mt-4 inline-flex">
                    <input type="file" className="hidden" accept=".csv,.xls,.xlsx" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
                    <span className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium cursor-pointer hover:bg-primary/90">
                      Select file
                    </span>
                  </label>
                </>
              ) : (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-md bg-secondary flex items-center justify-center">
                      <FileSpreadsheet className="h-5 w-5 text-primary" />
                    </div>
                    <div className="text-left">
                      <div className="text-sm font-medium">{file.name}</div>
                      <div className="text-xs text-muted-foreground">{(file.size / 1024).toFixed(1)} KB · validated</div>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => setFile(null)}><X className="h-4 w-4" /></Button>
                </div>
              )}
            </div>

            {file && (
              <div className="mt-6">
                <div className="text-sm font-semibold mb-3">2. Validation results</div>
                <div className="border border-border rounded-md overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/40 hover:bg-muted/40">
                        <TableHead className="text-xs uppercase">Reference</TableHead>
                        <TableHead className="text-xs uppercase">Beneficiary</TableHead>
                        <TableHead className="text-xs uppercase">Account</TableHead>
                        <TableHead className="text-xs uppercase">Bank</TableHead>
                        <TableHead className="text-xs uppercase text-right">Amount</TableHead>
                        <TableHead className="text-xs uppercase">Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {previewItems.map((p, i) => (
                        <TableRow key={i} className={!p.valid ? "bg-destructive/5" : ""}>
                          <TableCell className="font-mono text-xs">{p.ref}</TableCell>
                          <TableCell>{p.name}</TableCell>
                          <TableCell className="font-mono text-xs">{p.account}</TableCell>
                          <TableCell>{p.bank}</TableCell>
                          <TableCell className="text-right tabular-nums">{formatMoney(p.amount)}</TableCell>
                          <TableCell>
                            {p.valid ? (
                              <span className="inline-flex items-center gap-1 text-xs text-success"><CheckCircle2 className="h-3.5 w-3.5" /> Valid</span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-xs text-destructive"><AlertCircle className="h-3.5 w-3.5" /> {p.reason}</span>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-border/70 h-fit">
          <CardContent className="p-5 space-y-4">
            <div className="text-sm font-semibold">Batch summary</div>
            <div className="space-y-3">
              <Row k="Total records" v={String(previewItems.length)} />
              <Row k="Valid" v={String(validCount)} tone="success" />
              <Row k="Invalid" v={String(invalidCount)} tone={invalidCount ? "destructive" : "default"} />
              <Row k="Duplicate refs" v="1" tone={invalidCount ? "warning" : "default"} />
              <div className="border-t border-border pt-3" />
              <Row k="Total amount" v={formatMoney(total)} bold />
            </div>
            <Button
              className="w-full"
              disabled={!file || invalidCount > 0}
              onClick={() => {
                toast.success("Batch created and submitted for approval");
                navigate({ to: "/batches" });
              }}
            >
              Create batch & submit for approval
            </Button>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              By submitting, you confirm these payments comply with company policy and authorization mandates.
            </p>
          </CardContent>
        </Card>
      </div>
    </>
  );
}

function Row({ k, v, tone, bold }: { k: string; v: string; tone?: "default" | "success" | "destructive" | "warning"; bold?: boolean }) {
  const cls = tone === "success" ? "text-success" : tone === "destructive" ? "text-destructive" : tone === "warning" ? "text-warning-foreground" : "";
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-muted-foreground">{k}</span>
      <span className={`tabular-nums ${cls} ${bold ? "font-semibold text-base text-foreground" : ""}`}>{v}</span>
    </div>
  );
}
