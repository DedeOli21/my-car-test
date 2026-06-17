import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { nfeTypeOptions } from "@/lib/fiscal-options";
import { importarNFeSchema, type ImportarNFeFormValues } from "@/lib/fiscal-schemas";
import type { ImportarNFePayload } from "@/types/fiscal";
import type { Freight } from "@/types/fleet";

interface NFeImportModalProps {
  open: boolean;
  freights: Freight[];
  isSubmitting: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (payload: ImportarNFePayload) => Promise<void>;
}

const getFileList = (value: unknown): FileList | null => {
  if (typeof FileList !== "undefined" && value instanceof FileList) {
    return value;
  }

  return null;
};

const NFeImportModal = ({
  open,
  freights,
  isSubmitting,
  onOpenChange,
  onSubmit,
}: NFeImportModalProps) => {
  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ImportarNFeFormValues>({
    resolver: zodResolver(importarNFeSchema),
    values: {
      chaveAcesso: "",
      xmlFile: undefined,
      tipo: "SAIDA",
      valorProdutos: 0,
      freteId: "NONE",
    },
  });

  const submit = async (values: ImportarNFeFormValues) => {
    const fileList = getFileList(values.xmlFile);
    await onSubmit({
      chaveAcesso: values.chaveAcesso?.trim() || undefined,
      xmlFile: fileList?.[0] || null,
      tipo: values.tipo,
      valorProdutos: values.valorProdutos || 0,
      freteId: values.freteId === "NONE" ? null : values.freteId,
    });
    reset();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Importar NF-e</DialogTitle>
          <DialogDescription>
            Informe a chave de acesso de 44 dígitos ou envie o XML da nota fiscal.
          </DialogDescription>
        </DialogHeader>

        <form className="space-y-4" onSubmit={handleSubmit(submit)}>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="nfe-key">Chave de Acesso</Label>
              <Input id="nfe-key" inputMode="numeric" maxLength={44} {...register("chaveAcesso")} />
              {errors.chaveAcesso?.message ? (
                <p className="text-xs text-destructive">{errors.chaveAcesso.message}</p>
              ) : null}
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="nfe-xml">XML da NF-e</Label>
              <Input id="nfe-xml" type="file" accept=".xml,text/xml,application/xml" {...register("xmlFile")} />
            </div>

            <div className="space-y-1.5">
              <Label>Tipo</Label>
              <Controller
                control={control}
                name="tipo"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      {nfeTypeOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="nfe-value">Valor dos Produtos</Label>
              <Input id="nfe-value" type="number" step="0.01" {...register("valorProdutos")} />
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <Label>Frete vinculado</Label>
              <Controller
                control={control}
                name="freteId"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Opcional" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="NONE">Sem vínculo</SelectItem>
                      {freights.map((freight) => (
                        <SelectItem key={freight.id} value={freight.id}>
                          {freight.code} - {freight.origin} / {freight.destination}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Consultando SEFAZ..." : "Importar NF-e"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default NFeImportModal;
