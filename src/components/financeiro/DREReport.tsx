import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  TableRow,
} from "@/components/ui/table";
import { formatBRL } from "@/lib/financeiro-format";
import type { DRE, FinanceiroDREFiltros } from "@/types/financeiro";
import type { Customer, Driver, FleetRoute, Vehicle } from "@/types/fleet";

interface DREReportProps {
  dre: DRE;
  filters: FinanceiroDREFiltros;
  vehicles: Vehicle[];
  drivers: Driver[];
  customers: Customer[];
  routes: FleetRoute[];
  onFiltersChange: (filters: FinanceiroDREFiltros) => void;
  onExport: (format: "excel" | "pdf") => void;
}

const rows: Array<{ key: keyof DRE; label: string; emphasis?: boolean }> = [
  { key: "receitaBruta", label: "Receita Bruta" },
  { key: "deducoes", label: "Deduções" },
  { key: "receitaLiquida", label: "Receita Líquida", emphasis: true },
  { key: "custosOperacionais", label: "Custos Operacionais" },
  { key: "lucroBruto", label: "Lucro Bruto", emphasis: true },
  { key: "despesasAdministrativas", label: "Despesas Administrativas" },
  { key: "lucroLiquido", label: "Lucro Líquido", emphasis: true },
];

const DREReport = ({
  dre,
  filters,
  vehicles,
  drivers,
  customers,
  routes,
  onFiltersChange,
  onExport,
}: DREReportProps) => {
  return (
    <Card>
      <CardHeader className="space-y-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="text-base">DRE Dinâmico</CardTitle>
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
        </div>

        <div className="grid gap-3 md:grid-cols-4">
          <div className="space-y-1.5">
            <Label>Veículo</Label>
            <Select value={filters.vehicleId} onValueChange={(vehicleId) => onFiltersChange({ ...filters, vehicleId })}>
              <SelectTrigger><SelectValue placeholder="Todos" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Todos</SelectItem>
                {vehicles.map((vehicle) => <SelectItem key={vehicle.id} value={vehicle.id}>{vehicle.plate}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Motorista</Label>
            <Select value={filters.driverId} onValueChange={(driverId) => onFiltersChange({ ...filters, driverId })}>
              <SelectTrigger><SelectValue placeholder="Todos" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Todos</SelectItem>
                {drivers.map((driver) => <SelectItem key={driver.id} value={driver.id}>{driver.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Cliente</Label>
            <Select value={filters.customerId} onValueChange={(customerId) => onFiltersChange({ ...filters, customerId })}>
              <SelectTrigger><SelectValue placeholder="Todos" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Todos</SelectItem>
                {customers.map((customer) => <SelectItem key={customer.id} value={customer.id}>{customer.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Rota</Label>
            <Select value={filters.routeId} onValueChange={(routeId) => onFiltersChange({ ...filters, routeId })}>
              <SelectTrigger><SelectValue placeholder="Todos" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Todas</SelectItem>
                {routes.map((route) => <SelectItem key={route.id} value={route.id}>{route.routeName}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.key}>
                <TableCell className={row.emphasis ? "font-bold" : ""}>{row.label}</TableCell>
                <TableCell className={`text-right ${row.emphasis ? "font-bold text-primary" : ""}`}>
                  {formatBRL(dre[row.key])}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default DREReport;
