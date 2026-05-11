import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  title: string;
  description: string;
  confirmLabel: string;
  variant?: "default" | "destructive";
  requireComments?: boolean;
  onConfirm: (comments: string) => Promise<unknown> | unknown;
  loading?: boolean;
}

export function ConfirmActionDialog({
  open, onOpenChange, title, description, confirmLabel, variant = "default",
  requireComments = false, onConfirm, loading,
}: Props) {
  const [comments, setComments] = useState("");
  const disabled = loading || (requireComments && comments.trim().length < 3);

  const handleConfirm = async () => {
    await onConfirm(comments.trim());
    setComments("");
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!loading) { onOpenChange(v); if (!v) setComments(""); } }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <div className="space-y-2">
          <Label htmlFor="comments">
            Comments {requireComments && <span className="text-destructive">*</span>}
          </Label>
          <Textarea
            id="comments"
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            rows={3}
            placeholder={requireComments ? "Provide a reason (required)…" : "Optional comments…"}
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>Cancel</Button>
          <Button variant={variant} onClick={handleConfirm} disabled={disabled}>
            {loading ? "Working…" : confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
