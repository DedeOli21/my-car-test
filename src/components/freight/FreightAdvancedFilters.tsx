import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { freightStatusOptions } from "@/lib/fleet-options";
import type { Customer, Driver, FreightStatus, Vehicle } from "@/types/fleet";

export interface FreightAdvancedFiltersValue {
  search: string;
  startDate: string;
  endDate: string;
  customerId: string;
  driverId: string;
  vehicleId: string;
  status: FreightStatus | "ALL";
}

interface FreightAdvancedFiltersProps {
  value: FreightAdvancedFiltersValue;
  customers: Customer[];
  drivers: Driver[];
  vehicles: Vehicle[];
  onChange: (value: FreightAdvancedFiltersValue) => void;
  onClear: () => void;
}

const updateFilter = <K extends keyof FreightAdvancedFiltersValue>(
  value: FreightAdvancedFiltersValue,
  key: K,
  nextValue: FreightAdvancedFiltersValue[K]
) => ({
  ...value,
  [key]: nextValue,
});

const FreightAdvancedFilters = ({
  value,
  customers,
  drivers,
  vehicles,
  onChange,
  onClear,
}: FreightAdvancedFiltersProps) => {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-7">
          <div className="space-y-1.5 xl:col-span-2">
            <Label htmlFor="freight-search">Busca</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="freight-search"
                value={value.search}
                onChange={(event) => onChange(updateFilter(value, "search", event.target.value))}
                placeholder="Código, cliente, rota, placa"
                className="pl-9"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="freight-start-date">Data Início</Label>
            <Input
              id="freight-start-date"
              type="date"
              value={value.startDate}
              onChange={(event) => onChange(updateFilter(value, "startDate", event.target.value))}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="freight-end-date">Data Fim</Label>
            <Input
              id="freight-end-date"
              type="date"
              value={value.endDate}
              onChange={(event) => onChange(updateFilter(value, "endDate", event.target.value))}
            />
          </div>

          <div className="space-y-1.5">
            <Label>Cliente</Label>
            <Select value={value.customerId} onValueChange={(nextValue) => onChange(updateFilter(value, "customerId", nextValue))}>
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

          <div className="space-y-1.5">
            <Label>Motorista</Label>
            <Select value={value.driverId} onValueChange={(nextValue) => onChange(updateFilter(value, "driverId", nextValue))}>
              <SelectTrigger>
                <SelectValue placeholder="Todos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Todos</SelectItem>
                {drivers.map((driver) => (
                  <SelectItem key={driver.id} value={driver.id}>
                    {driver.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label>Veículo</Label>
            <Select value={value.vehicleId} onValueChange={(nextValue) => onChange(updateFilter(value, "vehicleId", nextValue))}>
              <SelectTrigger>
                <SelectValue placeholder="Todos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Todos</SelectItem>
                {vehicles.map((vehicle) => (
                  <SelectItem key={vehicle.id} value={vehicle.id}>
                    {vehicle.plate}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label>Status</Label>
            <Select
              value={value.status}
              onValueChange={(nextValue: FreightAdvancedFiltersValue["status"]) =>
                onChange(updateFilter(value, "status", nextValue))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Todos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Todos</SelectItem>
                {freightStatusOptions.map((status) => (
                  <SelectItem key={status.value} value={status.value}>
                    {status.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-end">
            <Button type="button" variant="outline" className="w-full" onClick={onClear}>
              Limpar
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default FreightAdvancedFilters;
