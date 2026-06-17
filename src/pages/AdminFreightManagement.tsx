import { useCallback, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import StatusBlock from "@/components/app/StatusBlock";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import FreightAdvancedFilters, {
  type FreightAdvancedFiltersValue,
} from "@/components/freight/FreightAdvancedFilters";
import FreightDetailsView from "@/components/freight/FreightDetailsView";
import FreightKanbanBoard from "@/components/freight/FreightKanbanBoard";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { getFriendlyErrorMessage } from "@/lib/error-messages";
import { toAppError } from "@/lib/errors";
import { queryKeys } from "@/lib/query-keys";
import { customerService } from "@/services/fleet/customer-service";
import { driverService } from "@/services/fleet/driver-service";
import { fleetRouteService } from "@/services/fleet/fleet-route-service";
import { freightService } from "@/services/fleet/freight-service";
import { vehicleService } from "@/services/fleet/vehicle-service";
import type { CreateFreightExpensePayload, Freight, FreightStatus } from "@/types/fleet";

const emptyFilters: FreightAdvancedFiltersValue = {
  search: "",
  startDate: "",
  endDate: "",
  customerId: "ALL",
  driverId: "ALL",
  vehicleId: "ALL",
  status: "ALL",
};

const normalize = (value: unknown) => String(value ?? "").toLowerCase().trim();

const isWithinDateRange = (dateValue: string, startDate: string, endDate: string) => {
  if (!startDate && !endDate) {
    return true;
  }

  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) {
    return false;
  }

  const start = startDate ? new Date(`${startDate}T00:00:00`) : null;
  const end = endDate ? new Date(`${endDate}T23:59:59`) : null;

  if (start && date < start) {
    return false;
  }

  if (end && date > end) {
    return false;
  }

  return true;
};

const AdminFreightManagement = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { user } = useAuth();
  const [filters, setFilters] = useState<FreightAdvancedFiltersValue>(emptyFilters);
  const [selectedFreight, setSelectedFreight] = useState<Freight | null>(null);
  const [expenseDialogOpen, setExpenseDialogOpen] = useState(false);

  const freightsQuery = useQuery({
    queryKey: queryKeys.freights,
    queryFn: freightService.getFreights,
  });
  const customersQuery = useQuery({
    queryKey: queryKeys.customers,
    queryFn: customerService.getCustomers,
  });
  const driversQuery = useQuery({
    queryKey: queryKeys.drivers,
    queryFn: driverService.getDrivers,
  });
  const vehiclesQuery = useQuery({
    queryKey: queryKeys.vehicles,
    queryFn: vehicleService.getVehicles,
  });
  const routesQuery = useQuery({
    queryKey: queryKeys.fleetRoutes,
    queryFn: fleetRouteService.getRoutes,
  });

  const selectedFreightId = selectedFreight?.id || "";

  const expensesQuery = useQuery({
    queryKey: queryKeys.freightExpenses(selectedFreightId),
    queryFn: () => freightService.getFreightExpenses(selectedFreightId),
    enabled: Boolean(selectedFreightId),
  });

  const timelineQuery = useQuery({
    queryKey: queryKeys.freightTimeline(selectedFreightId),
    queryFn: () => freightService.getFreightTimeline(selectedFreightId),
    enabled: Boolean(selectedFreightId),
  });

  const financialSummaryQuery = useQuery({
    queryKey: queryKeys.freightFinancialSummary(selectedFreightId),
    queryFn: () => freightService.getFreightFinancialSummary(selectedFreightId),
    enabled: Boolean(selectedFreightId),
  });

  const statusMutation = useMutation({
    mutationFn: ({ freight, status }: { freight: Freight; status: FreightStatus }) =>
      freightService.updateFreightStatus({
        freightId: freight.id,
        status,
        updatedBy: user?.name || user?.email || "Admin",
      }),
    onSuccess: async (updatedFreight) => {
      setSelectedFreight((current) => (current?.id === updatedFreight.id ? updatedFreight : current));
      await queryClient.invalidateQueries({ queryKey: queryKeys.freights });
      await queryClient.invalidateQueries({ queryKey: queryKeys.freightTimeline(updatedFreight.id) });
      toast({
        title: "Status atualizado",
        description: "O frete foi movido para a nova coluna.",
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Falha ao atualizar status",
        description: getFriendlyErrorMessage(toAppError(error)),
      });
    },
  });

  const expenseMutation = useMutation({
    mutationFn: freightService.createFreightExpense,
    onSuccess: async (_, payload) => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.freightExpenses(payload.freightId) });
      await queryClient.invalidateQueries({ queryKey: queryKeys.freightFinancialSummary(payload.freightId) });
      toast({
        title: "Despesa lançada",
        description: "Resumo financeiro recalculado automaticamente.",
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Falha ao lançar despesa",
        description: getFriendlyErrorMessage(toAppError(error)),
      });
    },
  });

  const customers = useMemo(() => customersQuery.data || [], [customersQuery.data]);
  const drivers = useMemo(() => driversQuery.data || [], [driversQuery.data]);
  const vehicles = useMemo(() => vehiclesQuery.data || [], [vehiclesQuery.data]);
  const routes = useMemo(() => routesQuery.data || [], [routesQuery.data]);
  const freights = useMemo(() => freightsQuery.data || [], [freightsQuery.data]);

  const customerName = useCallback(
    (freight: Freight) =>
      customers.find((customer) => customer.id === freight.customerId)?.name || "",
    [customers]
  );
  const driverName = useCallback(
    (freight: Freight) =>
      drivers.find((driver) => driver.id === freight.driverId)?.name || "",
    [drivers]
  );
  const vehiclePlate = useCallback(
    (freight: Freight) =>
      vehicles.find((vehicle) => vehicle.id === freight.vehicleId)?.plate || "",
    [vehicles]
  );

  const filteredFreights = useMemo(() => {
    const search = normalize(filters.search);

    return freights.filter((freight) => {
      const matchesSearch =
        !search ||
        [
          freight.code,
          customerName(freight),
          driverName(freight),
          vehiclePlate(freight),
          freight.origin,
          freight.destination,
          freight.cargoType,
        ].some((value) => normalize(value).includes(search));

      const matchesDate = isWithinDateRange(
        freight.estimatedDeliveryAt,
        filters.startDate,
        filters.endDate
      );
      const matchesCustomer =
        filters.customerId === "ALL" || freight.customerId === filters.customerId;
      const matchesDriver = filters.driverId === "ALL" || freight.driverId === filters.driverId;
      const matchesVehicle = filters.vehicleId === "ALL" || freight.vehicleId === filters.vehicleId;
      const matchesStatus = filters.status === "ALL" || freight.status === filters.status;

      return (
        matchesSearch &&
        matchesDate &&
        matchesCustomer &&
        matchesDriver &&
        matchesVehicle &&
        matchesStatus
      );
    });
  }, [filters, freights, customerName, driverName, vehiclePlate]);

  const selectedCustomer = selectedFreight
    ? customers.find((customer) => customer.id === selectedFreight.customerId)
    : undefined;
  const selectedDriver = selectedFreight
    ? drivers.find((driver) => driver.id === selectedFreight.driverId)
    : undefined;
  const selectedVehicle = selectedFreight
    ? vehicles.find((vehicle) => vehicle.id === selectedFreight.vehicleId)
    : undefined;
  const selectedRoute = selectedFreight?.routeId
    ? routes.find((route) => route.id === selectedFreight.routeId)
    : undefined;

  const isLoading =
    freightsQuery.isLoading ||
    customersQuery.isLoading ||
    driversQuery.isLoading ||
    vehiclesQuery.isLoading ||
    routesQuery.isLoading;

  const error =
    freightsQuery.error ||
    customersQuery.error ||
    driversQuery.error ||
    vehiclesQuery.error ||
    routesQuery.error;

  if (isLoading) {
    return (
      <div className="p-4">
        <StatusBlock title="Carregando gestão de fretes" isLoading />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <StatusBlock
          title="Falha ao carregar gestão de fretes"
          description={getFriendlyErrorMessage(toAppError(error))}
          onRetry={() => {
            freightsQuery.refetch();
            customersQuery.refetch();
            driversQuery.refetch();
            vehiclesQuery.refetch();
            routesQuery.refetch();
          }}
        />
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4 pb-24">
      <div className="space-y-1">
        <p className="text-sm text-muted-foreground">Admin</p>
        <h1 className="text-2xl font-bold">Gestão de Fretes</h1>
      </div>

      <FreightAdvancedFilters
        value={filters}
        customers={customers}
        drivers={drivers}
        vehicles={vehicles}
        onChange={setFilters}
        onClear={() => setFilters(emptyFilters)}
      />

      <FreightKanbanBoard
        freights={filteredFreights}
        customers={customers}
        drivers={drivers}
        vehicles={vehicles}
        isUpdatingStatus={statusMutation.isPending}
        onOpenDetails={setSelectedFreight}
        onStatusChange={(freight, status) => {
          if (freight.status !== status) {
            statusMutation.mutate({ freight, status });
          }
        }}
      />

      <Dialog open={Boolean(selectedFreight)} onOpenChange={(open) => !open && setSelectedFreight(null)}>
        <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-5xl">
          <DialogHeader>
            <DialogTitle>Detalhes do Frete</DialogTitle>
            <DialogDescription>
              Visão centralizada da operação, despesas, margem e histórico da viagem.
            </DialogDescription>
          </DialogHeader>

          {selectedFreight && financialSummaryQuery.data ? (
            <FreightDetailsView
              freight={selectedFreight}
              customer={selectedCustomer}
              driver={selectedDriver}
              vehicle={selectedVehicle}
              route={selectedRoute}
              expenses={expensesQuery.data || []}
              timeline={timelineQuery.data || []}
              financialSummary={financialSummaryQuery.data}
              expenseDialogOpen={expenseDialogOpen}
              isSavingExpense={expenseMutation.isPending}
              onExpenseDialogOpenChange={setExpenseDialogOpen}
              onCreateExpense={(payload: CreateFreightExpensePayload) =>
                expenseMutation.mutateAsync(payload)
              }
            />
          ) : (
            <StatusBlock title="Carregando detalhes do frete" isLoading />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminFreightManagement;
