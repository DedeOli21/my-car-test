import { ArrowRight, Eye } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { freightStatusOptions, optionLabel } from "@/lib/fleet-options";
import { formatCurrency } from "@/lib/format";
import type { Customer, Driver, Freight, FreightStatus, Vehicle } from "@/types/fleet";

interface FreightKanbanBoardProps {
  freights: Freight[];
  customers: Customer[];
  drivers: Driver[];
  vehicles: Vehicle[];
  onOpenDetails: (freight: Freight) => void;
  onStatusChange: (freight: Freight, status: FreightStatus) => void;
  isUpdatingStatus?: boolean;
}

const findName = <T extends { id: string }>(
  rows: T[],
  id: string,
  fallback: string,
  selector: (row: T) => string
) => {
  const row = rows.find((item) => item.id === id);
  return row ? selector(row) : fallback;
};

const FreightKanbanBoard = ({
  freights,
  customers,
  drivers,
  vehicles,
  onOpenDetails,
  onStatusChange,
  isUpdatingStatus = false,
}: FreightKanbanBoardProps) => {
  const customerName = (freight: Freight) =>
    findName(customers, freight.customerId, "Cliente não informado", (customer) => customer.name);
  const driverName = (freight: Freight) =>
    findName(drivers, freight.driverId, "Motorista não informado", (driver) => driver.name);
  const vehiclePlate = (freight: Freight) =>
    findName(vehicles, freight.vehicleId, "Placa não informada", (vehicle) => vehicle.plate);

  return (
    <div className="grid gap-4 xl:grid-cols-4">
      {freightStatusOptions.map((statusOption) => {
        const columnFreights = freights.filter((freight) => freight.status === statusOption.value);

        return (
          <Card key={statusOption.value} className="min-h-[360px]">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between gap-2">
                <CardTitle className="text-base">{statusOption.label}</CardTitle>
                <Badge variant="secondary">{columnFreights.length}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {columnFreights.length ? (
                columnFreights.map((freight) => (
                  <div key={freight.id} className="rounded-md border bg-background p-3 shadow-sm">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold">{freight.code}</p>
                        <p className="text-xs text-muted-foreground">{customerName(freight)}</p>
                      </div>
                      <p className="font-semibold text-primary">{formatCurrency(freight.totalValue)}</p>
                    </div>

                    <div className="mt-3 space-y-1 text-sm">
                      <p className="text-muted-foreground">Motorista: {driverName(freight)}</p>
                      <p className="text-muted-foreground">Veículo: {vehiclePlate(freight)}</p>
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <span>{freight.origin}</span>
                        <ArrowRight className="h-3.5 w-3.5" />
                        <span>{freight.destination}</span>
                      </div>
                    </div>

                    <div className="mt-3 grid gap-2">
                      <Select
                        value={freight.status}
                        disabled={isUpdatingStatus}
                        onValueChange={(nextStatus: FreightStatus) => onStatusChange(freight, nextStatus)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Mover para" />
                        </SelectTrigger>
                        <SelectContent>
                          {freightStatusOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {optionLabel(freightStatusOptions, option.value)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button type="button" variant="outline" className="gap-2" onClick={() => onOpenDetails(freight)}>
                        <Eye className="h-4 w-4" />
                        Detalhes
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-md border border-dashed p-4 text-center text-sm text-muted-foreground">
                  Nenhum frete neste status.
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default FreightKanbanBoard;
