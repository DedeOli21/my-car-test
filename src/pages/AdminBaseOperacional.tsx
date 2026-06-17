import { useCallback, useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AdminCrudTable, { type AdminTableColumn } from "@/components/admin/AdminCrudTable";
import { AdminField, AdminFormActions } from "@/components/admin/AdminFormLayout";
import { useToast } from "@/hooks/use-toast";
import {
  cargoTypeOptions,
  driverEmploymentOptions,
  freightStatusOptions,
  optionLabel,
  vehicleStatusOptions,
  vehicleTypeOptions,
} from "@/lib/fleet-options";
import {
  customerFormSchema,
  driverFormSchema,
  fleetRouteFormSchema,
  freightFormSchema,
  gasStationFormSchema,
  refuelingFormSchema,
  supplierFormSchema,
  vehicleFormSchema,
  type CustomerFormValues,
  type DriverFormValues,
  type FleetRouteFormValues,
  type FreightFormValues,
  type GasStationFormValues,
  type RefuelingFormValues,
  type SupplierFormValues,
  type VehicleFormValues,
} from "@/lib/fleet-schemas";
import { formatCurrency, formatDate } from "@/lib/format";
import { queryKeys } from "@/lib/query-keys";
import { firstFileToAttachment, filesToAttachments } from "@/services/fleet/mock-repository";
import { customerService } from "@/services/fleet/customer-service";
import { driverService } from "@/services/fleet/driver-service";
import { fleetRouteService } from "@/services/fleet/fleet-route-service";
import { freightService } from "@/services/fleet/freight-service";
import { gasStationService } from "@/services/fleet/gas-station-service";
import { refuelingService } from "@/services/fleet/refueling-service";
import { supplierService } from "@/services/fleet/supplier-service";
import { vehicleService } from "@/services/fleet/vehicle-service";
import type {
  AuditableEntity,
  CreateCustomerPayload,
  CreateDriverPayload,
  CreateFleetRoutePayload,
  CreateFreightPayload,
  CreateGasStationPayload,
  CreateRefuelingPayload,
  CreateSupplierPayload,
  CreateVehiclePayload,
  Customer,
  Driver,
  FleetRoute,
  Freight,
  GasStation,
  Refueling,
  Supplier,
  UpdateCustomerPayload,
  UpdateDriverPayload,
  UpdateFleetRoutePayload,
  UpdateFreightPayload,
  UpdateGasStationPayload,
  UpdateRefuelingPayload,
  UpdateSupplierPayload,
  UpdateVehiclePayload,
  Vehicle,
} from "@/types/fleet";

type CrudFunctions<T extends AuditableEntity, CreatePayload, UpdatePayload> = {
  list: () => Promise<T[]>;
  create: (payload: CreatePayload) => Promise<T>;
  update: (id: string, payload: UpdatePayload) => Promise<T>;
  remove: (id: string) => Promise<void>;
};

type Option<T extends string = string> = {
  value: T;
  label: string;
};

const normalize = (value: unknown) => String(value ?? "").toLowerCase().trim();

const formatDateTime = (value: string) => {
  if (!value) {
    return "-";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  });
};

const totalRefuelingAmount = (refueling: Refueling) =>
  refueling.liters * refueling.pricePerLiter;

const fileCountLabel = (count: number) =>
  count === 1 ? "1 arquivo" : `${count} arquivos`;

const getFileList = (value: unknown): FileList | null => {
  if (typeof FileList !== "undefined" && value instanceof FileList) {
    return value;
  }

  return null;
};

const FilterSelect = ({
  value,
  onChange,
  placeholder,
  options,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  options: Option[];
}) => (
  <Select value={value} onValueChange={onChange}>
    <SelectTrigger className="min-w-[180px]">
      <SelectValue placeholder={placeholder} />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="ALL">Todos</SelectItem>
      {options.map((option) => (
        <SelectItem key={option.value} value={option.value}>
          {option.label}
        </SelectItem>
      ))}
    </SelectContent>
  </Select>
);

const SelectField = <T extends string>({
  value,
  onChange,
  options,
  placeholder,
}: {
  value?: T;
  onChange: (value: T) => void;
  options: Array<Option<T>>;
  placeholder: string;
}) => (
  <Select value={value} onValueChange={onChange}>
    <SelectTrigger>
      <SelectValue placeholder={placeholder} />
    </SelectTrigger>
    <SelectContent>
      {options.map((option) => (
        <SelectItem key={option.value} value={option.value}>
          {option.label}
        </SelectItem>
      ))}
    </SelectContent>
  </Select>
);

const EntityDialog = ({
  open,
  title,
  description,
  children,
  onOpenChange,
}: {
  open: boolean;
  title: string;
  description: string;
  children: React.ReactNode;
  onOpenChange: (open: boolean) => void;
}) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-2xl">
      <DialogHeader>
        <DialogTitle>{title}</DialogTitle>
        <DialogDescription>{description}</DialogDescription>
      </DialogHeader>
      {children}
    </DialogContent>
  </Dialog>
);

const useFleetCrud = <T extends AuditableEntity, CreatePayload, UpdatePayload>(
  queryKey: readonly unknown[],
  service: CrudFunctions<T, CreatePayload, UpdatePayload>,
  entityLabel: string
) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const query = useQuery({
    queryKey,
    queryFn: service.list,
  });

  const createMutation = useMutation({
    mutationFn: service.create,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey });
      toast({ title: `${entityLabel} criado`, description: "Registro salvo com sucesso." });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdatePayload }) =>
      service.update(id, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey });
      toast({ title: `${entityLabel} atualizado`, description: "Alterações salvas com sucesso." });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: service.remove,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey });
      toast({ title: `${entityLabel} removido`, description: "Registro excluído do mock." });
    },
  });

  return {
    rows: query.data || [],
    isLoading: query.isLoading,
    create: createMutation.mutateAsync,
    update: updateMutation.mutateAsync,
    remove: deleteMutation.mutateAsync,
    isSaving: createMutation.isPending || updateMutation.isPending,
  };
};

const VehicleForm = ({
  vehicle,
  isSaving,
  onCancel,
  onSubmit,
}: {
  vehicle: Vehicle | null;
  isSaving: boolean;
  onCancel: () => void;
  onSubmit: (payload: CreateVehiclePayload) => Promise<void>;
}) => {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<VehicleFormValues>({
    resolver: zodResolver(vehicleFormSchema),
    values: {
      plate: vehicle?.plate || "",
      type: vehicle?.type || "TOCO",
      capacity: vehicle?.capacity || 0,
      year: vehicle?.year || new Date().getFullYear(),
      status: vehicle?.status || "ATIVO",
      documents: undefined,
    },
  });

  const submit = async (values: VehicleFormValues) => {
    const files = filesToAttachments(getFileList(values.documents));
    await onSubmit({
      plate: values.plate.trim().toUpperCase(),
      type: values.type,
      capacity: values.capacity,
      year: values.year,
      status: values.status,
      documents: files.length ? files : vehicle?.documents || [],
    });
  };

  return (
    <form className="grid gap-4" onSubmit={handleSubmit(submit)}>
      <div className="grid gap-4 sm:grid-cols-2">
        <AdminField label="Placa" error={errors.plate?.message}>
          <Input {...register("plate")} placeholder="ABC1D23" />
        </AdminField>
        <AdminField label="Tipo" error={errors.type?.message}>
          <Controller
            control={control}
            name="type"
            render={({ field }) => (
              <SelectField value={field.value} onChange={field.onChange} options={vehicleTypeOptions} placeholder="Tipo" />
            )}
          />
        </AdminField>
        <AdminField label="Capacidade" error={errors.capacity?.message}>
          <Input type="number" step="0.01" {...register("capacity")} placeholder="Toneladas" />
        </AdminField>
        <AdminField label="Ano" error={errors.year?.message}>
          <Input type="number" {...register("year")} />
        </AdminField>
        <AdminField label="Status" error={errors.status?.message}>
          <Controller
            control={control}
            name="status"
            render={({ field }) => (
              <SelectField value={field.value} onChange={field.onChange} options={vehicleStatusOptions} placeholder="Status" />
            )}
          />
        </AdminField>
        <AdminField label="Documentos">
          <Input type="file" multiple {...register("documents")} />
        </AdminField>
      </div>
      <AdminFormActions isSubmitting={isSaving} onCancel={onCancel} />
    </form>
  );
};

const DriverForm = ({
  driver,
  isSaving,
  onCancel,
  onSubmit,
}: {
  driver: Driver | null;
  isSaving: boolean;
  onCancel: () => void;
  onSubmit: (payload: CreateDriverPayload) => Promise<void>;
}) => {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<DriverFormValues>({
    resolver: zodResolver(driverFormSchema),
    values: {
      name: driver?.name || "",
      cnh: driver?.cnh || "",
      cnhExpiresAt: driver?.cnhExpiresAt || "",
      phone: driver?.phone || "",
      employmentType: driver?.employmentType || "CLT",
      documents: undefined,
    },
  });

  const submit = async (values: DriverFormValues) => {
    const files = filesToAttachments(getFileList(values.documents));
    await onSubmit({
      name: values.name.trim(),
      cnh: values.cnh.trim(),
      cnhExpiresAt: values.cnhExpiresAt,
      phone: values.phone.trim(),
      employmentType: values.employmentType,
      documents: files.length ? files : driver?.documents || [],
    });
  };

  return (
    <form className="grid gap-4" onSubmit={handleSubmit(submit)}>
      <div className="grid gap-4 sm:grid-cols-2">
        <AdminField label="Nome" error={errors.name?.message}>
          <Input {...register("name")} placeholder="Nome completo" />
        </AdminField>
        <AdminField label="CNH" error={errors.cnh?.message}>
          <Input {...register("cnh")} placeholder="Numero da CNH" />
        </AdminField>
        <AdminField label="Validade CNH" error={errors.cnhExpiresAt?.message}>
          <Input type="date" {...register("cnhExpiresAt")} />
        </AdminField>
        <AdminField label="Telefone" error={errors.phone?.message}>
          <Input {...register("phone")} placeholder="(00) 00000-0000" />
        </AdminField>
        <AdminField label="Vínculo" error={errors.employmentType?.message}>
          <Controller
            control={control}
            name="employmentType"
            render={({ field }) => (
              <SelectField
                value={field.value}
                onChange={field.onChange}
                options={driverEmploymentOptions}
                placeholder="Vínculo"
              />
            )}
          />
        </AdminField>
        <AdminField label="Documentos">
          <Input type="file" multiple {...register("documents")} />
        </AdminField>
      </div>
      <AdminFormActions isSubmitting={isSaving} onCancel={onCancel} />
    </form>
  );
};

const CustomerForm = ({
  customer,
  isSaving,
  onCancel,
  onSubmit,
}: {
  customer: Customer | null;
  isSaving: boolean;
  onCancel: () => void;
  onSubmit: (payload: CreateCustomerPayload) => Promise<void>;
}) => {
  const { register, handleSubmit, formState: { errors } } = useForm<CustomerFormValues>({
    resolver: zodResolver(customerFormSchema),
    values: {
      name: customer?.name || "",
      taxId: customer?.taxId || "",
      phone: customer?.phone || "",
      address: customer?.address || "",
    },
  });

  return (
    <form className="grid gap-4" onSubmit={handleSubmit(onSubmit)}>
      <div className="grid gap-4 sm:grid-cols-2">
        <AdminField label="Nome" error={errors.name?.message}><Input {...register("name")} /></AdminField>
        <AdminField label="CNPJ/CPF" error={errors.taxId?.message}><Input {...register("taxId")} /></AdminField>
        <AdminField label="Telefone" error={errors.phone?.message}><Input {...register("phone")} /></AdminField>
        <AdminField label="Endereço" error={errors.address?.message}><Input {...register("address")} /></AdminField>
      </div>
      <AdminFormActions isSubmitting={isSaving} onCancel={onCancel} />
    </form>
  );
};

const SupplierForm = ({
  supplier,
  isSaving,
  onCancel,
  onSubmit,
}: {
  supplier: Supplier | null;
  isSaving: boolean;
  onCancel: () => void;
  onSubmit: (payload: CreateSupplierPayload) => Promise<void>;
}) => {
  const { register, handleSubmit, formState: { errors } } = useForm<SupplierFormValues>({
    resolver: zodResolver(supplierFormSchema),
    values: {
      name: supplier?.name || "",
      taxId: supplier?.taxId || "",
      serviceType: supplier?.serviceType || "",
    },
  });

  return (
    <form className="grid gap-4" onSubmit={handleSubmit(onSubmit)}>
      <div className="grid gap-4 sm:grid-cols-2">
        <AdminField label="Nome" error={errors.name?.message}><Input {...register("name")} /></AdminField>
        <AdminField label="CNPJ/CPF" error={errors.taxId?.message}><Input {...register("taxId")} /></AdminField>
        <AdminField label="Tipo de Serviço" error={errors.serviceType?.message}><Input {...register("serviceType")} /></AdminField>
      </div>
      <AdminFormActions isSubmitting={isSaving} onCancel={onCancel} />
    </form>
  );
};

const GasStationForm = ({
  gasStation,
  isSaving,
  onCancel,
  onSubmit,
}: {
  gasStation: GasStation | null;
  isSaving: boolean;
  onCancel: () => void;
  onSubmit: (payload: CreateGasStationPayload) => Promise<void>;
}) => {
  const { register, handleSubmit, formState: { errors } } = useForm<GasStationFormValues>({
    resolver: zodResolver(gasStationFormSchema),
    values: {
      name: gasStation?.name || "",
      cnpj: gasStation?.cnpj || "",
      address: gasStation?.address || "",
    },
  });

  return (
    <form className="grid gap-4" onSubmit={handleSubmit(onSubmit)}>
      <div className="grid gap-4 sm:grid-cols-2">
        <AdminField label="Nome" error={errors.name?.message}><Input {...register("name")} /></AdminField>
        <AdminField label="CNPJ" error={errors.cnpj?.message}><Input {...register("cnpj")} /></AdminField>
        <AdminField label="Endereço" error={errors.address?.message}><Input {...register("address")} /></AdminField>
      </div>
      <AdminFormActions isSubmitting={isSaving} onCancel={onCancel} />
    </form>
  );
};

const FleetRouteForm = ({
  route,
  isSaving,
  onCancel,
  onSubmit,
}: {
  route: FleetRoute | null;
  isSaving: boolean;
  onCancel: () => void;
  onSubmit: (payload: CreateFleetRoutePayload) => Promise<void>;
}) => {
  const { register, handleSubmit, formState: { errors } } = useForm<FleetRouteFormValues>({
    resolver: zodResolver(fleetRouteFormSchema),
    values: {
      routeName: route?.routeName || "",
      origin: route?.origin || "",
      destination: route?.destination || "",
      distanceKm: route?.distanceKm || 0,
    },
  });

  return (
    <form className="grid gap-4" onSubmit={handleSubmit(onSubmit)}>
      <div className="grid gap-4 sm:grid-cols-2">
        <AdminField label="Nome da Rota" error={errors.routeName?.message}><Input {...register("routeName")} /></AdminField>
        <AdminField label="Origem" error={errors.origin?.message}><Input {...register("origin")} /></AdminField>
        <AdminField label="Destino" error={errors.destination?.message}><Input {...register("destination")} /></AdminField>
        <AdminField label="Distância (km)" error={errors.distanceKm?.message}>
          <Input type="number" step="0.01" {...register("distanceKm")} />
        </AdminField>
      </div>
      <AdminFormActions isSubmitting={isSaving} onCancel={onCancel} />
    </form>
  );
};

const RefuelingForm = ({
  refueling,
  vehicles,
  drivers,
  gasStations,
  isSaving,
  onCancel,
  onSubmit,
}: {
  refueling: Refueling | null;
  vehicles: Vehicle[];
  drivers: Driver[];
  gasStations: GasStation[];
  isSaving: boolean;
  onCancel: () => void;
  onSubmit: (payload: CreateRefuelingPayload) => Promise<void>;
}) => {
  const vehicleOptions = vehicles.map((vehicle) => ({ value: vehicle.id, label: vehicle.plate }));
  const driverOptions = drivers.map((driver) => ({ value: driver.id, label: driver.name }));
  const gasStationOptions = gasStations.map((station) => ({ value: station.id, label: station.name }));

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<RefuelingFormValues>({
    resolver: zodResolver(refuelingFormSchema),
    values: {
      vehicleId: refueling?.vehicleId || vehicles[0]?.id || "",
      driverId: refueling?.driverId || drivers[0]?.id || "",
      gasStationId: refueling?.gasStationId || gasStations[0]?.id || "",
      liters: refueling?.liters || 0,
      pricePerLiter: refueling?.pricePerLiter || 0,
      odometer: refueling?.odometer || 0,
      receipt: undefined,
      refueledAt: refueling?.refueledAt || "",
    },
  });

  const submit = async (values: RefuelingFormValues) => {
    await onSubmit({
      vehicleId: values.vehicleId,
      driverId: values.driverId,
      gasStationId: values.gasStationId,
      liters: values.liters,
      pricePerLiter: values.pricePerLiter,
      odometer: values.odometer,
      receipt: firstFileToAttachment(getFileList(values.receipt)) || refueling?.receipt,
      refueledAt: values.refueledAt,
    });
  };

  return (
    <form className="grid gap-4" onSubmit={handleSubmit(submit)}>
      <div className="grid gap-4 sm:grid-cols-2">
        <AdminField label="Veículo" error={errors.vehicleId?.message}>
          <Controller
            control={control}
            name="vehicleId"
            render={({ field }) => <SelectField value={field.value} onChange={field.onChange} options={vehicleOptions} placeholder="Veículo" />}
          />
        </AdminField>
        <AdminField label="Motorista" error={errors.driverId?.message}>
          <Controller
            control={control}
            name="driverId"
            render={({ field }) => <SelectField value={field.value} onChange={field.onChange} options={driverOptions} placeholder="Motorista" />}
          />
        </AdminField>
        <AdminField label="Posto" error={errors.gasStationId?.message}>
          <Controller
            control={control}
            name="gasStationId"
            render={({ field }) => <SelectField value={field.value} onChange={field.onChange} options={gasStationOptions} placeholder="Posto" />}
          />
        </AdminField>
        <AdminField label="Data" error={errors.refueledAt?.message}>
          <Input type="datetime-local" {...register("refueledAt")} />
        </AdminField>
        <AdminField label="Litros" error={errors.liters?.message}>
          <Input type="number" step="0.001" {...register("liters")} />
        </AdminField>
        <AdminField label="Preço por Litro" error={errors.pricePerLiter?.message}>
          <Input type="number" step="0.001" {...register("pricePerLiter")} />
        </AdminField>
        <AdminField label="Hodômetro" error={errors.odometer?.message}>
          <Input type="number" {...register("odometer")} />
        </AdminField>
        <AdminField label="Comprovante">
          <Input type="file" accept="image/*,.pdf" {...register("receipt")} />
        </AdminField>
      </div>
      <AdminFormActions isSubmitting={isSaving} onCancel={onCancel} />
    </form>
  );
};

const FreightForm = ({
  freight,
  customers,
  drivers,
  vehicles,
  routes,
  isSaving,
  onCancel,
  onSubmit,
}: {
  freight: Freight | null;
  customers: Customer[];
  drivers: Driver[];
  vehicles: Vehicle[];
  routes: FleetRoute[];
  isSaving: boolean;
  onCancel: () => void;
  onSubmit: (payload: CreateFreightPayload) => Promise<void>;
}) => {
  const customerOptions = customers.map((customer) => ({ value: customer.id, label: customer.name }));
  const driverOptions = drivers.map((driver) => ({ value: driver.id, label: driver.name }));
  const vehicleOptions = vehicles.map((vehicle) => ({ value: vehicle.id, label: vehicle.plate }));
  const routeOptions = [
    { value: "NONE", label: "Sem rota vinculada" },
    ...routes.map((route) => ({ value: route.id, label: route.routeName })),
  ];

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<FreightFormValues>({
    resolver: zodResolver(freightFormSchema),
    values: {
      code: freight?.code || `FRT-${Date.now().toString().slice(-5)}`,
      customerId: freight?.customerId || customers[0]?.id || "",
      driverId: freight?.driverId || drivers[0]?.id || "",
      vehicleId: freight?.vehicleId || vehicles[0]?.id || "",
      routeId: freight?.routeId || "NONE",
      origin: freight?.origin || "",
      destination: freight?.destination || "",
      weight: freight?.weight || 0,
      cargoType: freight?.cargoType || "SECA",
      estimatedDeliveryAt: freight?.estimatedDeliveryAt || "",
      status: freight?.status || "AGENDADO",
      totalValue: freight?.totalValue || 0,
      margin: freight?.margin || 0,
    },
  });

  const submit = async (values: FreightFormValues) => {
    await onSubmit({
      code: values.code.trim().toUpperCase(),
      customerId: values.customerId,
      driverId: values.driverId,
      vehicleId: values.vehicleId,
      routeId: values.routeId === "NONE" ? undefined : values.routeId,
      origin: values.origin.trim(),
      destination: values.destination.trim(),
      weight: values.weight,
      cargoType: values.cargoType,
      estimatedDeliveryAt: values.estimatedDeliveryAt,
      status: values.status,
      totalValue: values.totalValue,
      margin: values.margin,
    });
  };

  return (
    <form className="grid gap-4" onSubmit={handleSubmit(submit)}>
      <div className="grid gap-4 sm:grid-cols-2">
        <AdminField label="Código do Frete" error={errors.code?.message}>
          <Input {...register("code")} placeholder="FRT-0001" />
        </AdminField>
        <AdminField label="Cliente" error={errors.customerId?.message}>
          <Controller
            control={control}
            name="customerId"
            render={({ field }) => <SelectField value={field.value} onChange={field.onChange} options={customerOptions} placeholder="Cliente" />}
          />
        </AdminField>
        <AdminField label="Motorista" error={errors.driverId?.message}>
          <Controller
            control={control}
            name="driverId"
            render={({ field }) => <SelectField value={field.value} onChange={field.onChange} options={driverOptions} placeholder="Motorista" />}
          />
        </AdminField>
        <AdminField label="Veículo" error={errors.vehicleId?.message}>
          <Controller
            control={control}
            name="vehicleId"
            render={({ field }) => <SelectField value={field.value} onChange={field.onChange} options={vehicleOptions} placeholder="Veículo" />}
          />
        </AdminField>
        <AdminField label="Rota">
          <Controller
            control={control}
            name="routeId"
            render={({ field }) => <SelectField value={field.value || "NONE"} onChange={field.onChange} options={routeOptions} placeholder="Rota" />}
          />
        </AdminField>
        <AdminField label="Origem" error={errors.origin?.message}><Input {...register("origin")} /></AdminField>
        <AdminField label="Destino" error={errors.destination?.message}><Input {...register("destination")} /></AdminField>
        <AdminField label="Peso" error={errors.weight?.message}><Input type="number" step="0.001" {...register("weight")} /></AdminField>
        <AdminField label="Valor Bruto" error={errors.totalValue?.message}>
          <Input type="number" step="0.01" {...register("totalValue")} />
        </AdminField>
        <AdminField label="Tipo de Carga" error={errors.cargoType?.message}>
          <Controller
            control={control}
            name="cargoType"
            render={({ field }) => <SelectField value={field.value} onChange={field.onChange} options={cargoTypeOptions} placeholder="Tipo de carga" />}
          />
        </AdminField>
        <AdminField label="Previsão de Entrega" error={errors.estimatedDeliveryAt?.message}>
          <Input type="datetime-local" {...register("estimatedDeliveryAt")} />
        </AdminField>
        <AdminField label="Status" error={errors.status?.message}>
          <Controller
            control={control}
            name="status"
            render={({ field }) => <SelectField value={field.value} onChange={field.onChange} options={freightStatusOptions} placeholder="Status" />}
          />
        </AdminField>
        <AdminField label="Margem (%)" error={errors.margin?.message}>
          <Input type="number" step="0.01" {...register("margin")} readOnly={false} />
        </AdminField>
      </div>
      <AdminFormActions isSubmitting={isSaving} onCancel={onCancel} />
    </form>
  );
};

const AdminBaseOperacional = () => {
  const vehiclesCrud = useFleetCrud<Vehicle, CreateVehiclePayload, UpdateVehiclePayload>(
    queryKeys.vehicles,
    {
      list: vehicleService.getVehicles,
      create: vehicleService.createVehicle,
      update: vehicleService.updateVehicle,
      remove: vehicleService.deleteVehicle,
    },
    "Veículo"
  );
  const driversCrud = useFleetCrud<Driver, CreateDriverPayload, UpdateDriverPayload>(
    queryKeys.drivers,
    {
      list: driverService.getDrivers,
      create: driverService.createDriver,
      update: driverService.updateDriver,
      remove: driverService.deleteDriver,
    },
    "Motorista"
  );
  const customersCrud = useFleetCrud<Customer, CreateCustomerPayload, UpdateCustomerPayload>(
    queryKeys.customers,
    {
      list: customerService.getCustomers,
      create: customerService.createCustomer,
      update: customerService.updateCustomer,
      remove: customerService.deleteCustomer,
    },
    "Cliente"
  );
  const suppliersCrud = useFleetCrud<Supplier, CreateSupplierPayload, UpdateSupplierPayload>(
    queryKeys.suppliers,
    {
      list: supplierService.getSuppliers,
      create: supplierService.createSupplier,
      update: supplierService.updateSupplier,
      remove: supplierService.deleteSupplier,
    },
    "Fornecedor"
  );
  const gasStationsCrud = useFleetCrud<GasStation, CreateGasStationPayload, UpdateGasStationPayload>(
    queryKeys.gasStations,
    {
      list: gasStationService.getGasStations,
      create: gasStationService.createGasStation,
      update: gasStationService.updateGasStation,
      remove: gasStationService.deleteGasStation,
    },
    "Posto"
  );
  const routesCrud = useFleetCrud<FleetRoute, CreateFleetRoutePayload, UpdateFleetRoutePayload>(
    queryKeys.fleetRoutes,
    {
      list: fleetRouteService.getRoutes,
      create: fleetRouteService.createRoute,
      update: fleetRouteService.updateRoute,
      remove: fleetRouteService.deleteRoute,
    },
    "Rota"
  );
  const refuelingsCrud = useFleetCrud<Refueling, CreateRefuelingPayload, UpdateRefuelingPayload>(
    queryKeys.refuelings,
    {
      list: refuelingService.getRefuelings,
      create: refuelingService.createRefueling,
      update: refuelingService.updateRefueling,
      remove: refuelingService.deleteRefueling,
    },
    "Abastecimento"
  );
  const freightsCrud = useFleetCrud<Freight, CreateFreightPayload, UpdateFreightPayload>(
    queryKeys.freights,
    {
      list: freightService.getFreights,
      create: freightService.createFreight,
      update: freightService.updateFreight,
      remove: freightService.deleteFreight,
    },
    "Frete"
  );

  const [vehicleSearch, setVehicleSearch] = useState("");
  const [vehicleStatus, setVehicleStatus] = useState("ALL");
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [vehicleDialogOpen, setVehicleDialogOpen] = useState(false);

  const [driverSearch, setDriverSearch] = useState("");
  const [driverEmployment, setDriverEmployment] = useState("ALL");
  const [editingDriver, setEditingDriver] = useState<Driver | null>(null);
  const [driverDialogOpen, setDriverDialogOpen] = useState(false);

  const [customerSearch, setCustomerSearch] = useState("");
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [customerDialogOpen, setCustomerDialogOpen] = useState(false);

  const [supplierSearch, setSupplierSearch] = useState("");
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [supplierDialogOpen, setSupplierDialogOpen] = useState(false);

  const [gasStationSearch, setGasStationSearch] = useState("");
  const [editingGasStation, setEditingGasStation] = useState<GasStation | null>(null);
  const [gasStationDialogOpen, setGasStationDialogOpen] = useState(false);

  const [routeSearch, setRouteSearch] = useState("");
  const [editingRoute, setEditingRoute] = useState<FleetRoute | null>(null);
  const [routeDialogOpen, setRouteDialogOpen] = useState(false);

  const [refuelingSearch, setRefuelingSearch] = useState("");
  const [editingRefueling, setEditingRefueling] = useState<Refueling | null>(null);
  const [refuelingDialogOpen, setRefuelingDialogOpen] = useState(false);

  const [freightSearch, setFreightSearch] = useState("");
  const [freightStatus, setFreightStatus] = useState("ALL");
  const [editingFreight, setEditingFreight] = useState<Freight | null>(null);
  const [freightDialogOpen, setFreightDialogOpen] = useState(false);

  const vehicleName = useCallback(
    (id: string) => vehiclesCrud.rows.find((vehicle) => vehicle.id === id)?.plate || "-",
    [vehiclesCrud.rows]
  );
  const driverName = useCallback(
    (id: string) => driversCrud.rows.find((driver) => driver.id === id)?.name || "-",
    [driversCrud.rows]
  );
  const customerName = useCallback(
    (id: string) => customersCrud.rows.find((customer) => customer.id === id)?.name || "-",
    [customersCrud.rows]
  );
  const gasStationName = useCallback(
    (id: string) => gasStationsCrud.rows.find((station) => station.id === id)?.name || "-",
    [gasStationsCrud.rows]
  );

  const removeWithConfirmation = async (label: string, remove: () => Promise<void>) => {
    if (window.confirm(`Excluir ${label}?`)) {
      await remove();
    }
  };

  const vehicles = useMemo(() => {
    const search = normalize(vehicleSearch);
    return vehiclesCrud.rows.filter((vehicle) => {
      const matchesSearch = [vehicle.plate, vehicle.type, vehicle.year].some((value) =>
        normalize(value).includes(search)
      );
      const matchesStatus = vehicleStatus === "ALL" || vehicle.status === vehicleStatus;
      return matchesSearch && matchesStatus;
    });
  }, [vehicleSearch, vehicleStatus, vehiclesCrud.rows]);

  const drivers = useMemo(() => {
    const search = normalize(driverSearch);
    return driversCrud.rows.filter((driver) => {
      const matchesSearch = [driver.name, driver.cnh, driver.phone].some((value) =>
        normalize(value).includes(search)
      );
      const matchesEmployment =
        driverEmployment === "ALL" || driver.employmentType === driverEmployment;
      return matchesSearch && matchesEmployment;
    });
  }, [driverEmployment, driverSearch, driversCrud.rows]);

  const customers = useMemo(() => {
    const search = normalize(customerSearch);
    return customersCrud.rows.filter((customer) =>
      [customer.name, customer.taxId, customer.phone, customer.address].some((value) =>
        normalize(value).includes(search)
      )
    );
  }, [customerSearch, customersCrud.rows]);

  const suppliers = useMemo(() => {
    const search = normalize(supplierSearch);
    return suppliersCrud.rows.filter((supplier) =>
      [supplier.name, supplier.taxId, supplier.serviceType].some((value) =>
        normalize(value).includes(search)
      )
    );
  }, [supplierSearch, suppliersCrud.rows]);

  const gasStations = useMemo(() => {
    const search = normalize(gasStationSearch);
    return gasStationsCrud.rows.filter((station) =>
      [station.name, station.cnpj, station.address].some((value) =>
        normalize(value).includes(search)
      )
    );
  }, [gasStationSearch, gasStationsCrud.rows]);

  const routes = useMemo(() => {
    const search = normalize(routeSearch);
    return routesCrud.rows.filter((route) =>
      [route.routeName, route.origin, route.destination, route.distanceKm].some((value) =>
        normalize(value).includes(search)
      )
    );
  }, [routeSearch, routesCrud.rows]);

  const refuelings = useMemo(() => {
    const search = normalize(refuelingSearch);
    return refuelingsCrud.rows.filter((refueling) =>
      [
        vehicleName(refueling.vehicleId),
        driverName(refueling.driverId),
        gasStationName(refueling.gasStationId),
        refueling.odometer,
      ].some((value) => normalize(value).includes(search))
    );
  }, [refuelingSearch, refuelingsCrud.rows, vehicleName, driverName, gasStationName]);

  const freights = useMemo(() => {
    const search = normalize(freightSearch);
    return freightsCrud.rows.filter((freight) => {
      const matchesSearch = [
        customerName(freight.customerId),
        driverName(freight.driverId),
        vehicleName(freight.vehicleId),
        freight.origin,
        freight.destination,
        freight.cargoType,
      ].some((value) => normalize(value).includes(search));
      const matchesStatus = freightStatus === "ALL" || freight.status === freightStatus;
      return matchesSearch && matchesStatus;
    });
  }, [freightSearch, freightStatus, freightsCrud.rows, customerName, driverName, vehicleName]);

  const vehicleColumns: AdminTableColumn<Vehicle>[] = [
    { header: "Placa", cell: (vehicle) => <span className="font-semibold">{vehicle.plate}</span> },
    { header: "Tipo", cell: (vehicle) => optionLabel(vehicleTypeOptions, vehicle.type) },
    { header: "Capacidade", cell: (vehicle) => `${vehicle.capacity} t` },
    { header: "Ano", cell: (vehicle) => vehicle.year },
    { header: "Status", cell: (vehicle) => <Badge variant="secondary">{optionLabel(vehicleStatusOptions, vehicle.status)}</Badge> },
    { header: "Docs", cell: (vehicle) => fileCountLabel(vehicle.documents.length) },
  ];

  const driverColumns: AdminTableColumn<Driver>[] = [
    { header: "Nome", cell: (driver) => <span className="font-semibold">{driver.name}</span> },
    { header: "CNH", cell: (driver) => driver.cnh },
    { header: "Validade", cell: (driver) => formatDate(driver.cnhExpiresAt) },
    { header: "Telefone", cell: (driver) => driver.phone },
    { header: "Vínculo", cell: (driver) => optionLabel(driverEmploymentOptions, driver.employmentType) },
    { header: "Docs", cell: (driver) => fileCountLabel(driver.documents.length) },
  ];

  const customerColumns: AdminTableColumn<Customer>[] = [
    { header: "Nome", cell: (customer) => <span className="font-semibold">{customer.name}</span> },
    { header: "CNPJ/CPF", cell: (customer) => customer.taxId },
    { header: "Telefone", cell: (customer) => customer.phone },
    { header: "Endereço", cell: (customer) => customer.address },
  ];

  const supplierColumns: AdminTableColumn<Supplier>[] = [
    { header: "Nome", cell: (supplier) => <span className="font-semibold">{supplier.name}</span> },
    { header: "CNPJ/CPF", cell: (supplier) => supplier.taxId },
    { header: "Serviço", cell: (supplier) => supplier.serviceType },
  ];

  const gasStationColumns: AdminTableColumn<GasStation>[] = [
    { header: "Nome", cell: (station) => <span className="font-semibold">{station.name}</span> },
    { header: "CNPJ", cell: (station) => station.cnpj },
    { header: "Endereço", cell: (station) => station.address },
  ];

  const routeColumns: AdminTableColumn<FleetRoute>[] = [
    { header: "Rota", cell: (route) => <span className="font-semibold">{route.routeName}</span> },
    { header: "Origem", cell: (route) => route.origin },
    { header: "Destino", cell: (route) => route.destination },
    { header: "Distância", cell: (route) => `${route.distanceKm} km` },
  ];

  const refuelingColumns: AdminTableColumn<Refueling>[] = [
    { header: "Data", cell: (refueling) => formatDateTime(refueling.refueledAt) },
    { header: "Veículo", cell: (refueling) => vehicleName(refueling.vehicleId) },
    { header: "Motorista", cell: (refueling) => driverName(refueling.driverId) },
    { header: "Posto", cell: (refueling) => gasStationName(refueling.gasStationId) },
    { header: "Litros", cell: (refueling) => refueling.liters.toLocaleString("pt-BR") },
    { header: "Total", cell: (refueling) => formatCurrency(totalRefuelingAmount(refueling)) },
    { header: "Hodômetro", cell: (refueling) => refueling.odometer.toLocaleString("pt-BR") },
  ];

  const freightColumns: AdminTableColumn<Freight>[] = [
    { header: "Código", cell: (freight) => <span className="font-semibold">{freight.code}</span> },
    { header: "Cliente", cell: (freight) => <span className="font-semibold">{customerName(freight.customerId)}</span> },
    { header: "Motorista", cell: (freight) => driverName(freight.driverId) },
    { header: "Veículo", cell: (freight) => vehicleName(freight.vehicleId) },
    { header: "Origem", cell: (freight) => freight.origin },
    { header: "Destino", cell: (freight) => freight.destination },
    { header: "Carga", cell: (freight) => optionLabel(cargoTypeOptions, freight.cargoType) },
    { header: "Valor", cell: (freight) => formatCurrency(freight.totalValue) },
    { header: "Entrega", cell: (freight) => formatDateTime(freight.estimatedDeliveryAt) },
    { header: "Status", cell: (freight) => <Badge variant="secondary">{optionLabel(freightStatusOptions, freight.status)}</Badge> },
    { header: "Margem", cell: (freight) => `${freight.margin}%` },
  ];

  return (
    <div className="p-4 space-y-4 pb-24">
      <div className="space-y-1">
        <p className="text-sm text-muted-foreground">Admin</p>
        <h1 className="text-2xl font-bold">Base Operacional</h1>
      </div>

      <Tabs defaultValue="vehicles" className="space-y-4">
        <TabsList className="h-auto flex-wrap justify-start">
          <TabsTrigger value="vehicles">Veículos</TabsTrigger>
          <TabsTrigger value="drivers">Motoristas</TabsTrigger>
          <TabsTrigger value="customers">Clientes</TabsTrigger>
          <TabsTrigger value="suppliers">Fornecedores</TabsTrigger>
          <TabsTrigger value="gas-stations">Postos</TabsTrigger>
          <TabsTrigger value="routes">Rotas</TabsTrigger>
          <TabsTrigger value="refuelings">Abastecimentos</TabsTrigger>
          <TabsTrigger value="freights">Fretes</TabsTrigger>
        </TabsList>

        <TabsContent value="vehicles">
          <AdminCrudTable
            title="Veículos"
            rows={vehicles}
            columns={vehicleColumns}
            searchValue={vehicleSearch}
            searchPlaceholder="Buscar por placa, tipo ou ano"
            emptyMessage={vehiclesCrud.isLoading ? "Carregando veículos..." : "Nenhum veículo encontrado."}
            onSearchChange={setVehicleSearch}
            filters={
              <FilterSelect
                value={vehicleStatus}
                onChange={setVehicleStatus}
                placeholder="Status"
                options={vehicleStatusOptions}
              />
            }
            onCreate={() => {
              setEditingVehicle(null);
              setVehicleDialogOpen(true);
            }}
            onEdit={(vehicle) => {
              setEditingVehicle(vehicle);
              setVehicleDialogOpen(true);
            }}
            onDelete={(vehicle) => removeWithConfirmation(vehicle.plate, () => vehiclesCrud.remove(vehicle.id))}
          />
        </TabsContent>

        <TabsContent value="drivers">
          <AdminCrudTable
            title="Motoristas"
            rows={drivers}
            columns={driverColumns}
            searchValue={driverSearch}
            searchPlaceholder="Buscar por nome, CNH ou telefone"
            emptyMessage={driversCrud.isLoading ? "Carregando motoristas..." : "Nenhum motorista encontrado."}
            onSearchChange={setDriverSearch}
            filters={
              <FilterSelect
                value={driverEmployment}
                onChange={setDriverEmployment}
                placeholder="Vínculo"
                options={driverEmploymentOptions}
              />
            }
            onCreate={() => {
              setEditingDriver(null);
              setDriverDialogOpen(true);
            }}
            onEdit={(driver) => {
              setEditingDriver(driver);
              setDriverDialogOpen(true);
            }}
            onDelete={(driver) => removeWithConfirmation(driver.name, () => driversCrud.remove(driver.id))}
          />
        </TabsContent>

        <TabsContent value="customers">
          <AdminCrudTable
            title="Clientes"
            rows={customers}
            columns={customerColumns}
            searchValue={customerSearch}
            searchPlaceholder="Buscar por nome, documento, telefone ou endereço"
            emptyMessage={customersCrud.isLoading ? "Carregando clientes..." : "Nenhum cliente encontrado."}
            onSearchChange={setCustomerSearch}
            onCreate={() => {
              setEditingCustomer(null);
              setCustomerDialogOpen(true);
            }}
            onEdit={(customer) => {
              setEditingCustomer(customer);
              setCustomerDialogOpen(true);
            }}
            onDelete={(customer) => removeWithConfirmation(customer.name, () => customersCrud.remove(customer.id))}
          />
        </TabsContent>

        <TabsContent value="suppliers">
          <AdminCrudTable
            title="Fornecedores"
            rows={suppliers}
            columns={supplierColumns}
            searchValue={supplierSearch}
            searchPlaceholder="Buscar por nome, documento ou serviço"
            emptyMessage={suppliersCrud.isLoading ? "Carregando fornecedores..." : "Nenhum fornecedor encontrado."}
            onSearchChange={setSupplierSearch}
            onCreate={() => {
              setEditingSupplier(null);
              setSupplierDialogOpen(true);
            }}
            onEdit={(supplier) => {
              setEditingSupplier(supplier);
              setSupplierDialogOpen(true);
            }}
            onDelete={(supplier) => removeWithConfirmation(supplier.name, () => suppliersCrud.remove(supplier.id))}
          />
        </TabsContent>

        <TabsContent value="gas-stations">
          <AdminCrudTable
            title="Postos"
            rows={gasStations}
            columns={gasStationColumns}
            searchValue={gasStationSearch}
            searchPlaceholder="Buscar por nome, CNPJ ou endereço"
            emptyMessage={gasStationsCrud.isLoading ? "Carregando postos..." : "Nenhum posto encontrado."}
            onSearchChange={setGasStationSearch}
            onCreate={() => {
              setEditingGasStation(null);
              setGasStationDialogOpen(true);
            }}
            onEdit={(gasStation) => {
              setEditingGasStation(gasStation);
              setGasStationDialogOpen(true);
            }}
            onDelete={(station) => removeWithConfirmation(station.name, () => gasStationsCrud.remove(station.id))}
          />
        </TabsContent>

        <TabsContent value="routes">
          <AdminCrudTable
            title="Rotas"
            rows={routes}
            columns={routeColumns}
            searchValue={routeSearch}
            searchPlaceholder="Buscar por nome, origem, destino ou km"
            emptyMessage={routesCrud.isLoading ? "Carregando rotas..." : "Nenhuma rota encontrada."}
            onSearchChange={setRouteSearch}
            onCreate={() => {
              setEditingRoute(null);
              setRouteDialogOpen(true);
            }}
            onEdit={(route) => {
              setEditingRoute(route);
              setRouteDialogOpen(true);
            }}
            onDelete={(route) => removeWithConfirmation(route.routeName, () => routesCrud.remove(route.id))}
          />
        </TabsContent>

        <TabsContent value="refuelings">
          <AdminCrudTable
            title="Abastecimentos"
            rows={refuelings}
            columns={refuelingColumns}
            searchValue={refuelingSearch}
            searchPlaceholder="Buscar por veículo, motorista, posto ou hodômetro"
            emptyMessage={refuelingsCrud.isLoading ? "Carregando abastecimentos..." : "Nenhum abastecimento encontrado."}
            onSearchChange={setRefuelingSearch}
            onCreate={() => {
              setEditingRefueling(null);
              setRefuelingDialogOpen(true);
            }}
            onEdit={(refueling) => {
              setEditingRefueling(refueling);
              setRefuelingDialogOpen(true);
            }}
            onDelete={(refueling) => removeWithConfirmation(vehicleName(refueling.vehicleId), () => refuelingsCrud.remove(refueling.id))}
          />
        </TabsContent>

        <TabsContent value="freights">
          <AdminCrudTable
            title="Fretes / Viagens"
            rows={freights}
            columns={freightColumns}
            searchValue={freightSearch}
            searchPlaceholder="Buscar por cliente, motorista, veículo, origem ou destino"
            emptyMessage={freightsCrud.isLoading ? "Carregando fretes..." : "Nenhum frete encontrado."}
            onSearchChange={setFreightSearch}
            filters={
              <FilterSelect
                value={freightStatus}
                onChange={setFreightStatus}
                placeholder="Status"
                options={freightStatusOptions}
              />
            }
            onCreate={() => {
              setEditingFreight(null);
              setFreightDialogOpen(true);
            }}
            onEdit={(freight) => {
              setEditingFreight(freight);
              setFreightDialogOpen(true);
            }}
            onDelete={(freight) => removeWithConfirmation(customerName(freight.customerId), () => freightsCrud.remove(freight.id))}
          />
        </TabsContent>
      </Tabs>

      <EntityDialog
        open={vehicleDialogOpen}
        onOpenChange={setVehicleDialogOpen}
        title={editingVehicle ? "Editar Veículo" : "Novo Veículo"}
        description="Cadastre placa, capacidade, status operacional e documentos do veículo."
      >
        <VehicleForm
          vehicle={editingVehicle}
          isSaving={vehiclesCrud.isSaving}
          onCancel={() => setVehicleDialogOpen(false)}
          onSubmit={async (payload) => {
            if (editingVehicle) {
              await vehiclesCrud.update({ id: editingVehicle.id, payload });
            } else {
              await vehiclesCrud.create(payload);
            }
            setVehicleDialogOpen(false);
          }}
        />
      </EntityDialog>

      <EntityDialog
        open={driverDialogOpen}
        onOpenChange={setDriverDialogOpen}
        title={editingDriver ? "Editar Motorista" : "Novo Motorista"}
        description="Mantenha CNH, vínculo, telefone e documentos do motorista atualizados."
      >
        <DriverForm
          driver={editingDriver}
          isSaving={driversCrud.isSaving}
          onCancel={() => setDriverDialogOpen(false)}
          onSubmit={async (payload) => {
            if (editingDriver) {
              await driversCrud.update({ id: editingDriver.id, payload });
            } else {
              await driversCrud.create(payload);
            }
            setDriverDialogOpen(false);
          }}
        />
      </EntityDialog>

      <EntityDialog
        open={customerDialogOpen}
        onOpenChange={setCustomerDialogOpen}
        title={editingCustomer ? "Editar Cliente" : "Novo Cliente"}
        description="Cadastro base para emissão, cobrança e vínculo dos fretes."
      >
        <CustomerForm
          customer={editingCustomer}
          isSaving={customersCrud.isSaving}
          onCancel={() => setCustomerDialogOpen(false)}
          onSubmit={async (payload) => {
            if (editingCustomer) {
              await customersCrud.update({ id: editingCustomer.id, payload });
            } else {
              await customersCrud.create(payload);
            }
            setCustomerDialogOpen(false);
          }}
        />
      </EntityDialog>

      <EntityDialog
        open={supplierDialogOpen}
        onOpenChange={setSupplierDialogOpen}
        title={editingSupplier ? "Editar Fornecedor" : "Novo Fornecedor"}
        description="Fornecedores ficam disponíveis para despesas, manutenção e serviços."
      >
        <SupplierForm
          supplier={editingSupplier}
          isSaving={suppliersCrud.isSaving}
          onCancel={() => setSupplierDialogOpen(false)}
          onSubmit={async (payload) => {
            if (editingSupplier) {
              await suppliersCrud.update({ id: editingSupplier.id, payload });
            } else {
              await suppliersCrud.create(payload);
            }
            setSupplierDialogOpen(false);
          }}
        />
      </EntityDialog>

      <EntityDialog
        open={gasStationDialogOpen}
        onOpenChange={setGasStationDialogOpen}
        title={editingGasStation ? "Editar Posto" : "Novo Posto"}
        description="Postos são usados no lançamento de abastecimentos."
      >
        <GasStationForm
          gasStation={editingGasStation}
          isSaving={gasStationsCrud.isSaving}
          onCancel={() => setGasStationDialogOpen(false)}
          onSubmit={async (payload) => {
            if (editingGasStation) {
              await gasStationsCrud.update({ id: editingGasStation.id, payload });
            } else {
              await gasStationsCrud.create(payload);
            }
            setGasStationDialogOpen(false);
          }}
        />
      </EntityDialog>

      <EntityDialog
        open={routeDialogOpen}
        onOpenChange={setRouteDialogOpen}
        title={editingRoute ? "Editar Rota" : "Nova Rota"}
        description="Rotas padronizam origem, destino e distância para fretes recorrentes."
      >
        <FleetRouteForm
          route={editingRoute}
          isSaving={routesCrud.isSaving}
          onCancel={() => setRouteDialogOpen(false)}
          onSubmit={async (payload) => {
            if (editingRoute) {
              await routesCrud.update({ id: editingRoute.id, payload });
            } else {
              await routesCrud.create(payload);
            }
            setRouteDialogOpen(false);
          }}
        />
      </EntityDialog>

      <EntityDialog
        open={refuelingDialogOpen}
        onOpenChange={setRefuelingDialogOpen}
        title={editingRefueling ? "Editar Abastecimento" : "Novo Abastecimento"}
        description="Vincule veículo, motorista, posto, hodômetro e comprovante."
      >
        <RefuelingForm
          refueling={editingRefueling}
          vehicles={vehiclesCrud.rows}
          drivers={driversCrud.rows}
          gasStations={gasStationsCrud.rows}
          isSaving={refuelingsCrud.isSaving}
          onCancel={() => setRefuelingDialogOpen(false)}
          onSubmit={async (payload) => {
            if (editingRefueling) {
              await refuelingsCrud.update({ id: editingRefueling.id, payload });
            } else {
              await refuelingsCrud.create(payload);
            }
            setRefuelingDialogOpen(false);
          }}
        />
      </EntityDialog>

      <EntityDialog
        open={freightDialogOpen}
        onOpenChange={setFreightDialogOpen}
        title={editingFreight ? "Editar Frete" : "Novo Frete"}
        description="Estruture a viagem com cliente, motorista, veículo, carga, entrega e status."
      >
        <FreightForm
          freight={editingFreight}
          customers={customersCrud.rows}
          drivers={driversCrud.rows}
          vehicles={vehiclesCrud.rows}
          routes={routesCrud.rows}
          isSaving={freightsCrud.isSaving}
          onCancel={() => setFreightDialogOpen(false)}
          onSubmit={async (payload) => {
            if (editingFreight) {
              await freightsCrud.update({ id: editingFreight.id, payload });
            } else {
              await freightsCrud.create(payload);
            }
            setFreightDialogOpen(false);
          }}
        />
      </EntityDialog>
    </div>
  );
};

export default AdminBaseOperacional;
