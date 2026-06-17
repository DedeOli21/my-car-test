import { useState } from "react";
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
import { formatBRL } from "@/lib/financeiro-format";
import type { BaixaFinanceiraPayload, TransacaoFinanceira } from "@/types/financeiro";

interface BaixaFinanceiraModalProps {
  transaction: TransacaoFinanceira | null;
  open: boolean;
  isSubmitting: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (payload: BaixaFinanceiraPayload) => Promise<void>;
}

const bankAccounts = [
  "Banco do Brasil - 0001",
  "Itaú - 341",
  "Santander - 033",
];

const today = new Date().toISOString().slice(0, 10);

const BaixaFinanceiraModal = ({
  transaction,
  open,
  isSubmitting,
  onOpenChange,
  onSubmit,
}: BaixaFinanceiraModalProps) => {
  const [dataPagamento, setDataPagamento] = useState(today);
  const [contaBancaria, setContaBancaria] = useState(bankAccounts[0]);

  const submit = async () => {
    if (!transaction) return;
    await onSubmit({
      transacaoId: transaction.id,
      dataPagamento,
      contaBancaria,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirmar Baixa</DialogTitle>
          <DialogDescription>
            {transaction
              ? `${transaction.descricao} - ${formatBRL(transaction.valor)}`
              : "Selecione uma transação para baixar."}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="payment-date">Data efetiva</Label>
            <Input
              id="payment-date"
              type="date"
              value={dataPagamento}
              onChange={(event) => setDataPagamento(event.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <Label>Conta bancária</Label>
            <Select value={contaBancaria} onValueChange={setContaBancaria}>
              <SelectTrigger>
                <SelectValue placeholder="Conta bancária" />
              </SelectTrigger>
              <SelectContent>
                {bankAccounts.map((account) => (
                  <SelectItem key={account} value={account}>
                    {account}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="button" disabled={!transaction || isSubmitting} onClick={submit}>
              {isSubmitting ? "Baixando..." : "Confirmar baixa"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BaixaFinanceiraModal;
