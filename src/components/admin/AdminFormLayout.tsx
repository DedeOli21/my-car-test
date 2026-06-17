import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

interface AdminFieldProps {
  label: string;
  error?: string;
  children: ReactNode;
}

export const AdminField = ({ label, error, children }: AdminFieldProps) => (
  <div className="space-y-1.5">
    <Label>{label}</Label>
    {children}
    {error ? <p className="text-xs text-destructive">{error}</p> : null}
  </div>
);

interface AdminFormActionsProps {
  isSubmitting: boolean;
  onCancel: () => void;
  submitLabel?: string;
}

export const AdminFormActions = ({
  isSubmitting,
  onCancel,
  submitLabel = "Salvar",
}: AdminFormActionsProps) => (
  <DialogFooter>
    <Button type="button" variant="outline" onClick={onCancel}>
      Cancelar
    </Button>
    <Button type="submit" disabled={isSubmitting}>
      {isSubmitting ? "Salvando..." : submitLabel}
    </Button>
  </DialogFooter>
);
