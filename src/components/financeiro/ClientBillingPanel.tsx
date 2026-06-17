import { useMemo, useState } from "react";
import { Download, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatBRL, formatShortDate } from "@/lib/financeiro-format";
import type { FaturaConsolidada, FaturamentoFiltro } from "@/types/financeiro";
import type { Customer, Freight } from "@/types/fleet";

interface ClientBillingPanelProps {
  customers: Customer[];
  freights: Freight[];
  invoices: FaturaConsolidada[];
  isSubmitting: boolean;
  onGenerateInvoice: (filters: FaturamentoFiltro) => Promise<void>;
  onExport: (format: "excel" | "pdf") => void;
}

const ClientBillingPanel = ({
  customers,
  freights,
  invoices,
  isSubmitting,
  onGenerateInvoice,
  onExport,
}: ClientBillingPanelProps) => {
  const [clienteId, setClienteId] = useState<string>("ALL");
  const [dataInicio, setDataInicio] = useState("2026-06-01");
  const [dataFim, setDataFim] = useState("2026-06-30");

  const selectedFreights = useMemo(
    () =>
      freights.filter((freight) => {
        const matchesCustomer = clienteId === "ALL" || freight.customerId === clienteId;
        const delivery = new Date(freight.estimatedDeliveryAt);
        return (
          matchesCustomer &&
          delivery >= new Date(`${dataInicio}T00:00:00`) &&
          delivery <= new Date(`${dataFim}T23:59:59`)
        );
      }),
    [clienteId, dataFim, dataInicio, freights]
  );

  const customerName = (id: string) =>
    customers.find((customer) => customer.id === id)?.name || "-";

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="text-base">Faturamento por Cliente</CardTitle>
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
        <CardContent className="space-y-4">
          <div className="grid gap-3 md:grid-cols-4">
            <div className="space-y-1.5">
              <Label>Cliente</Label>
              <Select value={clienteId} onValueChange={setClienteId}>
                <SelectTrigger>
                  <SelectValue placeholder="Cliente" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Todos</SelectItem>
                  {customers.map((customer) => (
                    <SelectItem key={customer.id} value={customer.id}>
                      {customer.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Data Início</Label>
              <Input type="date" value={dataInicio} onChange={(event) => setDataInicio(event.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Data Fim</Label>
              <Input type="date" value={dataFim} onChange={(event) => setDataFim(event.target.value)} />
            </div>
            <div className="flex items-end">
              <Button
                type="button"
                className="w-full gap-2"
                disabled={isSubmitting}
                onClick={() => onGenerateInvoice({ clienteId, dataInicio, dataFim })}
              >
                <FileText className="h-4 w-4" />
                {isSubmitting ? "Gerando..." : "Gerar Fatura"}
              </Button>
            </div>
          </div>

          <div className="rounded-md border p-3">
            <p className="text-sm text-muted-foreground">Fretes no período</p>
            <p className="text-2xl font-bold">
              {formatBRL(selectedFreights.reduce((sum, freight) => sum + freight.totalValue, 0))}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Faturas Geradas</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cliente</TableHead>
                <TableHead>Período</TableHead>
                <TableHead>Fretes</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Valor</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoices.length ? (
                invoices.map((invoice) => (
                  <TableRow key={invoice.id}>
                    <TableCell>{customerName(invoice.clienteId)}</TableCell>
                    <TableCell>{formatShortDate(invoice.dataInicio)} até {formatShortDate(invoice.dataFim)}</TableCell>
                    <TableCell>{invoice.freteIds.length}</TableCell>
                    <TableCell>{invoice.status}</TableCell>
                    <TableCell>{formatBRL(invoice.valorTotal)}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                    Nenhuma fatura consolidada gerada ainda.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default ClientBillingPanel;
