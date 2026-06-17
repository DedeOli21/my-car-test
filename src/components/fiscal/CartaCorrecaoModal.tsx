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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cartaCorrecaoSchema, type CartaCorrecaoFormValues } from "@/lib/fiscal-schemas";
import type { CTe } from "@/types/fiscal";

interface CartaCorrecaoModalProps {
  cte: CTe | null;
  open: boolean;
  isSubmitting: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (correcao: string) => Promise<void>;
}

const CartaCorrecaoModal = ({
  cte,
  open,
  isSubmitting,
  onOpenChange,
  onSubmit,
}: CartaCorrecaoModalProps) => {
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CartaCorrecaoFormValues>({
    resolver: zodResolver(cartaCorrecaoSchema),
    values: { correcao: "" },
  });

  const submit = async (values: CartaCorrecaoFormValues) => {
    await onSubmit(values.correcao.trim());
    reset();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Emitir Carta de Correção</DialogTitle>
          <DialogDescription>
            {cte ? `CT-e ${cte.numero} série ${cte.serie}` : "Informe a correção do documento."}
          </DialogDescription>
        </DialogHeader>

        <form className="space-y-4" onSubmit={handleSubmit(submit)}>
          <div className="space-y-1.5">
            <Label>Correção / Justificativa</Label>
            <Controller
              control={control}
              name="correcao"
              render={({ field }) => (
                <Textarea
                  {...field}
                  rows={6}
                  placeholder="Descreva a correção fiscal a ser enviada como CC-e."
                />
              )}
            />
            {errors.correcao?.message ? (
              <p className="text-xs text-destructive">{errors.correcao.message}</p>
            ) : null}
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Enviando para SEFAZ..." : "Emitir CC-e"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CartaCorrecaoModal;
