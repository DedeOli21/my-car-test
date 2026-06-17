import { Download, Mail, MoreHorizontal, PenLine, RotateCcw, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { fiscalOptionLabel, fiscalStatusOptions } from "@/lib/fiscal-options";
import { formatCurrency } from "@/lib/format";
import type { CTe, FiscalDocumentFilters, FiscalDocumentStatus } from "@/types/fiscal";
import type { Customer, Freight } from "@/types/fleet";

interface CTeTableProps {
  ctes: CTe[];
  customers: Customer[];
  freights: Freight[];
  filters: FiscalDocumentFilters;
  isBusy?: boolean;
  onFiltersChange: (filters: FiscalDocumentFilters) => void;
  onOpenPdf: (cte: CTe) => void;
  onDownloadXml: (cte: CTe) => void;
  onCancel: (cte: CTe) => void;
  onCorrection: (cte: CTe) => void;
  onResendEmail: (cte: CTe) => void;
}

const formatDateTime = (value: string) =>
  new Date(value).toLocaleString("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  });

const CTeTable = ({
  ctes,
  customers,
  freights,
  filters,
  isBusy = false,
  onFiltersChange,
  onOpenPdf,
  onDownloadXml,
  onCancel,
  onCorrection,
  onResendEmail,
}: CTeTableProps) => {
  const customerName = (id: string) =>
    customers.find((customer) => customer.id === id)?.name || "-";
  const freightCode = (id: string) =>
    freights.find((freight) => freight.id === id)?.code || "-";

  return (
    <Card>
      <CardHeader className="space-y-3">
        <CardTitle className="text-base">CT-es Emitidos</CardTitle>
        <div className="grid gap-3 md:grid-cols-4">
          <div className="space-y-1.5">
            <Label>Status</Label>
            <Select
              value={filters.status}
              onValueChange={(status: FiscalDocumentStatus | "ALL") =>
                onFiltersChange({ ...filters, status })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Todos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Todos</SelectItem>
                {fiscalStatusOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label>Data Início</Label>
            <Input
              type="date"
              value={filters.startDate}
              onChange={(event) => onFiltersChange({ ...filters, startDate: event.target.value })}
            />
          </div>

          <div className="space-y-1.5">
            <Label>Data Fim</Label>
            <Input
              type="date"
              value={filters.endDate}
              onChange={(event) => onFiltersChange({ ...filters, endDate: event.target.value })}
            />
          </div>

          <div className="space-y-1.5">
            <Label>Tomador</Label>
            <Select
              value={filters.tomadorId}
              onValueChange={(tomadorId) => onFiltersChange({ ...filters, tomadorId })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Todos" />
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
        </div>
      </CardHeader>

      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Número</TableHead>
              <TableHead>Frete</TableHead>
              <TableHead>Tomador</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Emissão</TableHead>
              <TableHead>Valor</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {ctes.length ? (
              ctes.map((cte) => (
                <TableRow key={cte.id}>
                  <TableCell>
                    <div>
                      <p className="font-semibold">{cte.numero}</p>
                      <p className="text-xs text-muted-foreground">Série {cte.serie}</p>
                    </div>
                  </TableCell>
                  <TableCell>{freightCode(cte.freteId)}</TableCell>
                  <TableCell>{customerName(cte.tomadorId)}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">
                      {fiscalOptionLabel(fiscalStatusOptions, cte.status)}
                    </Badge>
                  </TableCell>
                  <TableCell>{formatDateTime(cte.dataEmissao)}</TableCell>
                  <TableCell>{formatCurrency(cte.valorTotal)}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" disabled={isBusy}>
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Ações</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onOpenPdf(cte)}>
                          <Download className="mr-2 h-4 w-4" />
                          Visualizar PDF
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onDownloadXml(cte)}>
                          <Download className="mr-2 h-4 w-4" />
                          Baixar XML
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem disabled={cte.status !== "AUTORIZADO"} onClick={() => onCancel(cte)}>
                          <XCircle className="mr-2 h-4 w-4" />
                          Cancelar CT-e
                        </DropdownMenuItem>
                        <DropdownMenuItem disabled={cte.status !== "AUTORIZADO"} onClick={() => onCorrection(cte)}>
                          <PenLine className="mr-2 h-4 w-4" />
                          Emitir CC-e
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onResendEmail(cte)}>
                          <Mail className="mr-2 h-4 w-4" />
                          Re-enviar E-mail
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                  Nenhum CT-e encontrado para os filtros selecionados.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        {isBusy ? (
          <div className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
            <RotateCcw className="h-4 w-4 animate-spin" />
            Processando operação fiscal...
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
};

export default CTeTable;
