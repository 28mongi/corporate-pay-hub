import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { PageHeader } from "@/components/app-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCallback, useState } from "react";
import { UploadCloud, FileSpreadsheet, CheckCircle2, AlertCircle, X, ChevronLeft } from "lucide-react";
import { formatMoney, formatNumber } from "@/lib/format";
import { toast } from "sonner";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { paymentFileApi } from "@/features/files/api/payment-file-api";
import { batchApi } from "@/features/batches/api/batch-api";
import { useSession } from "@/features/session/session-context";
import type { FileUploadResult, FileValidationResult } from "@/lib/types";

export const Route = createFileRoute("/_app/batches/upload")({
  component: UploadBatch,
  head: () => ({ meta: [{ title: "Upload Payment File — Corporate Pay Hub" }] }),
});

function downloadCsv(filename: string, rows: Array<Record<string, unknown>>) {
  if (!rows.length) return;
  const headers = Object.keys(rows[0]);
  const csv = [headers.join(",")].concat(
    rows.map((r) => headers.map((h) => JSON.stringify(r[h] ?? "")).join(","))
  ).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

function UploadBatch() {
  const navigate = useNavigate();
  const session = useSession();
  const [file, setFile] = useState<File | null>(null);
  const [drag, setDrag] = useState(false);
  const [validation, setValidation] = useState<FileValidationResult | null>(null);
  const [uploadResult, setUploadResult] = useState<FileUploadResult | null>(null);
  const [batchNo, setBatchNo] = useState("");
  const [debitAccount, setDebitAccount] = useState("");
  const [currency, setCurrency] = useState("TZS");

  const validateMut = useMutation({
    mutationFn: (f: File) => paymentFileApi.validatePaymentFile(f),
    onSuccess: (data) => { setValidation(data); setUploadResult(null); },
    onError: (e: Error) => toast.error(e.message),
  });
  const uploadMut = useMutation({
    mutationFn: (f: File) => paymentFileApi.uploadPaymentFile(f),
    onSuccess: (data) => {
      setUploadResult(data);
      if (data.currency) setCurrency(data.currency);
      toast.success("File uploaded. Provide batch details to continue.");
    },
    onError: (e: Error) => toast.error(e.message),
  });
  const createBatchMut = useMutation({
    mutationFn: () => {
      if (!uploadResult) throw new Error("No uploaded file");
      return batchApi.createBatch({
        fileId: uploadResult.fileId,
        batchNo: batchNo.trim(),
        debitAccount: debitAccount.trim(),
        currency: currency.trim(),
      });
    },
    onSuccess: (batch) => {
      toast.success("Batch created");
      navigate({ to: "/batches/$batchId", params: { batchId: batch.id } });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const handleFile = (f: File | null) => {
    setFile(f);
    setValidation(null);
    setUploadResult(null);
    if (f) validateMut.mutate(f);
  };

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setDrag(false);
    const f = e.dataTransfer.files?.[0]; if (f) handleFile(f);
  }, []);

  const reset = () => {
    setFile(null); setValidation(null); setUploadResult(null);
    setBatchNo(""); setDebitAccount("");
  };

  const canUpload = !!file && !!validation && validation.invalidRows === 0 && !uploadResult;
  const canCreate = !!uploadResult && batchNo.trim().length > 0 && debitAccount.trim().length > 0 && currency.trim().length > 0;

  return (
    <>
      <Link to="/batches" className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground mb-3">
        <ChevronLeft className="h-3.5 w-3.5" /> All batches
      </Link>
      <PageHeader title="Upload Payment File" description="Upload a CSV or Excel file. Every record is validated against the bank gateway before submission." />

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
                  <div className="text-xs text-muted-foreground mt-1">CSV, XLS or XLSX</div>
                  <label className="mt-4 inline-flex">
                    <input type="file" className="hidden" accept=".csv,.xls,.xlsx" onChange={(e) => handleFile(e.target.files?.[0] ?? null)} />
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
                      <div className="text-xs text-muted-foreground">
                        {(file.size / 1024).toFixed(1)} KB
                        {validateMut.isPending ? " · validating…" : validation ? " · validated" : ""}
                      </div>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" onClick={reset}><X className="h-4 w-4" /></Button>
                </div>
              )}
            </div>

            {validation && validation.invalidRows > 0 && (
              <div className="mt-6">
                <div className="flex items-center justify-between mb-3">
                  <div className="text-sm font-semibold">2. Validation errors ({validation.invalidRows})</div>
                  <Button size="sm" variant="outline" onClick={() => downloadCsv(`${validation.fileName}-errors.csv`, validation.errors)}>
                    Download errors as CSV
                  </Button>
                </div>
                <div className="border border-border rounded-md overflow-hidden max-h-80 overflow-y-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/40 hover:bg-muted/40">
                        <TableHead className="text-xs uppercase">Row</TableHead>
                        <TableHead className="text-xs uppercase">Field</TableHead>
                        <TableHead className="text-xs uppercase">Error</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {validation.errors.map((e, i) => (
                        <TableRow key={i} className="bg-destructive/5">
                          <TableCell className="font-mono text-xs">{e.rowNumber}</TableCell>
                          <TableCell className="text-xs">{e.field ?? "—"}</TableCell>
                          <TableCell className="text-xs">
                            <span className="inline-flex items-center gap-1 text-destructive">
                              <AlertCircle className="h-3.5 w-3.5" /> {e.message}
                            </span>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}

            {validation && validation.invalidRows === 0 && !uploadResult && (
              <div className="mt-6 p-4 rounded-md border border-success/30 bg-success/5 flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-success" />
                <div className="text-sm">
                  All {formatNumber(validation.validRows)} records are valid. You can upload this file.
                </div>
              </div>
            )}

            {uploadResult && (
              <div className="mt-6 space-y-4">
                <div className="text-sm font-semibold">3. Batch details</div>
                <div className="grid sm:grid-cols-3 gap-3">
                  <div className="space-y-1.5">
                    <Label>Batch number</Label>
                    <Input value={batchNo} onChange={(e) => setBatchNo(e.target.value)} placeholder="e.g. BTH-2026-0001" />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Debit account</Label>
                    <Input value={debitAccount} onChange={(e) => setDebitAccount(e.target.value)} placeholder="Account number" />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Currency</Label>
                    <Input value={currency} onChange={(e) => setCurrency(e.target.value.toUpperCase())} maxLength={3} />
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-border/70 h-fit">
          <CardContent className="p-5 space-y-4">
            <div className="text-sm font-semibold">Summary</div>
            <div className="space-y-3">
              <Row k="File" v={validation?.fileName ?? file?.name ?? "—"} />
              <Row k="Total rows" v={validation ? formatNumber(validation.totalRows) : "—"} />
              <Row k="Valid" v={validation ? formatNumber(validation.validRows) : "—"} tone="success" />
              <Row k="Invalid" v={validation ? formatNumber(validation.invalidRows) : "—"} tone={validation && validation.invalidRows > 0 ? "destructive" : "default"} />
              <div className="border-t border-border pt-3" />
              <Row k="Total amount" v={validation ? formatMoney(validation.totalAmount, validation.currency ?? currency) : "—"} bold />
              <Row k="Company" v={session.companyName ?? session.companyId ?? "—"} />
            </div>

            {!uploadResult ? (
              <Button
                className="w-full"
                disabled={!canUpload || uploadMut.isPending}
                onClick={() => file && uploadMut.mutate(file)}
              >
                {uploadMut.isPending ? "Uploading…" : "Upload validated file"}
              </Button>
            ) : (
              <Button
                className="w-full"
                disabled={!canCreate || createBatchMut.isPending}
                onClick={() => createBatchMut.mutate()}
              >
                {createBatchMut.isPending ? "Creating…" : "Create batch"}
              </Button>
            )}
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              All records are validated server-side. Backend remains the final authorization authority.
            </p>
          </CardContent>
        </Card>
      </div>
    </>
  );
}

function Row({ k, v, tone, bold }: { k: string; v: string; tone?: "default" | "success" | "destructive"; bold?: boolean }) {
  const cls = tone === "success" ? "text-success" : tone === "destructive" ? "text-destructive" : "";
  return (
    <div className="flex items-center justify-between text-sm gap-2">
      <span className="text-muted-foreground">{k}</span>
      <span className={`tabular-nums truncate ${cls} ${bold ? "font-semibold text-base text-foreground" : ""}`}>{v}</span>
    </div>
  );
}
