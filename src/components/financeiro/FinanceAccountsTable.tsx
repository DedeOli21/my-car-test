import { Download } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatBRL, formatShortDate } from "@/lib/financeiro-format";
import { financeiroOptionLabel, statusTransacaoOptions } from "@/lib/financeiro-options";
import type { TransacaoFinanceira } from "@/types/financeiro";
import type { Customer, Freight, Supplier } from "@/types/fleet";

interface FinanceAccountsTableProps {
  title: string;
  rows: TransacaoFinanceira[];
  customers: Customer[];
  suppliers: Supplier[];
  freights: Freight[];
  actionLabel: string;
  onSettle: (transaction: TransacaoFinanceira) => void;
  onExport: (format: "excel" | "pdf") => void;
}

const statusClass = {
  ATRASADO: "bg-red-500/15 text-red-500 border-red-500/30",
  PENDENTE: "bg-yellow-500/15 text-yellow-500 border-yellow-500/30",
  PAGO: "bg-green-500/15 text-green-500 border-green-500/30",
};

const FinanceAccountsTable = ({
  title,
  rows,
  customers,
  suppliers,
  freights,
  actionLabel,
  onSettle,
  onExport,
}: FinanceAccountsTableProps) => {
  const relatedName = (transaction: TransacaoFinanceira) => {
    if (transaction.clienteId) {
      return customers.find((customer) => customer.id === transaction.clienteId)?.name || "-";
    }
    if (transaction.fornecedorId) {
      return suppliers.find((supplier) => supplier.id === transaction.fornecedorId)?.name || "-";
    }
    return "-";
  };

  const freightCode = (transaction: TransacaoFinanceira) =>
    freights.find((freight) => freight.id === transaction.freteId)?.code || "-";

  return (
    <Card>
      <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <CardTitle className="text-base">{title}</CardTitle>
        <div className="flex gap-2">
          <Button type="button" variant="outline" className="gap-2" onClick={() => onExport("excel")}>
            <Download className="h-4 w-4" />
            Exportar Excel
          </Button>
          <Button type="button" variant="outline" className="gap-2" onClick={() => onExport("pdf")}>
            <Download className="h-4 w-4" />
            Exportar PDF
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Descrição</TableHead>
              <TableHead>Categoria</TableHead>
              <TableHead>Relacionado</TableHead>
              <TableHead>Frete</TableHead>
              <TableHead>Vencimento</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Valor</TableHead>
              <TableHead className="text-right">Ação</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length ? (
              rows.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell className="font-medium">{transaction.descricao}</TableCell>
                  <TableCell>{transaction.categoria}</TableCell>
                  <TableCell>{relatedName(transaction)}</TableCell>
                  <TableCell>{freightCode(transaction)}</TableCell>
                  <TableCell>{formatShortDate(transaction.dataVencimento)}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={statusClass[transaction.status]}>
                      {financeiroOptionLabel(statusTransacaoOptions, transaction.status)}
                    </Badge>
                  </TableCell>
                  <TableCell>{formatBRL(transaction.valor)}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      type="button"
                      size="sm"
                      disabled={transaction.status === "PAGO"}
                      onClick={() => onSettle(transaction)}
                    >
                      {actionLabel}
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={8} className="h-24 text-center text-muted-foreground">
                  Nenhum lançamento encontrado.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default FinanceAccountsTable;
