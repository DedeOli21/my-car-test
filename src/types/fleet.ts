export type EntityId = string;

export interface AuditableEntity {
  id: EntityId;
  createdAt: string;
  updatedAt: string;
}

export interface DocumentAttachment {
  name: string;
  url?: string;
  type?: string;
  size?: number;
}

export type VehicleType = "TOCO" | "TRUCK" | "CARRETA";
export type VehicleStatus = "ATIVO" | "MANUTENCAO" | "INATIVO";

export interface Vehicle extends AuditableEntity {
  plate: string;
  type: VehicleType;
  capacity: number;
  year: number;
  status: VehicleStatus;
  documents: DocumentAttachment[];
}

export type DriverEmploymentType = "CLT" | "TERCEIRIZADO" | "AGREGADO";

export interface Driver extends AuditableEntity {
  name: string;
  cnh: string;
  cnhExpiresAt: string;
  phone: string;
  employmentType: DriverEmploymentType;
  documents: DocumentAttachment[];
}

export interface Customer extends AuditableEntity {
  name: string;
  taxId: string;
  phone: string;
  address: string;
}

export interface Supplier extends AuditableEntity {
  name: string;
  taxId: string;
  serviceType: string;
}

export interface GasStation extends AuditableEntity {
  name: string;
  cnpj: string;
  address: string;
}

export interface FleetRoute extends AuditableEntity {
  routeName: string;
  origin: string;
  destination: string;
  distanceKm: number;
}

export interface Refueling extends AuditableEntity {
  vehicleId: EntityId;
  driverId: EntityId;
  gasStationId: EntityId;
  liters: number;
  pricePerLiter: number;
  odometer: number;
  receipt?: DocumentAttachment;
  refueledAt: string;
}

export type CargoType = "SECA" | "REFRIGERADA" | "PERIGOSA";
export type FreightStatus = "AGENDADO" | "EM_TRANSITO" | "CONCLUIDO" | "CANCELADO";
export type FreightExpenseType =
  | "PEDAGIO"
  | "COMBUSTIVEL"
  | "DIARIA"
  | "MANUTENCAO"
  | "COMISSAO"
  | "OUTROS";

export interface Freight extends AuditableEntity {
  code: string;
  customerId: EntityId;
  driverId: EntityId;
  vehicleId: EntityId;
  routeId?: EntityId;
  origin: string;
  destination: string;
  weight: number;
  cargoType: CargoType;
  estimatedDeliveryAt: string;
  status: FreightStatus;
  totalValue: number;
  margin: number;
}

export interface FreightExpense {
  id: EntityId;
  freightId: EntityId;
  type: FreightExpenseType;
  value: number;
  description: string;
  receiptUrl: string | null;
  createdAt: string;
}

export interface FreightTimelineEvent {
  id: EntityId;
  freightId: EntityId;
  title: string;
  description: string;
  status: FreightStatus;
  createdAt: string;
  updatedBy: string;
}

export interface FreightFinancialSummary {
  totalValue: number;
  totalExpenses: number;
  netProfit: number;
  marginPercentage: number;
}

export type CreateVehiclePayload = Omit<Vehicle, keyof AuditableEntity>;
export type UpdateVehiclePayload = Partial<CreateVehiclePayload>;

export type CreateDriverPayload = Omit<Driver, keyof AuditableEntity>;
export type UpdateDriverPayload = Partial<CreateDriverPayload>;

export type CreateCustomerPayload = Omit<Customer, keyof AuditableEntity>;
export type UpdateCustomerPayload = Partial<CreateCustomerPayload>;

export type CreateSupplierPayload = Omit<Supplier, keyof AuditableEntity>;
export type UpdateSupplierPayload = Partial<CreateSupplierPayload>;

export type CreateGasStationPayload = Omit<GasStation, keyof AuditableEntity>;
export type UpdateGasStationPayload = Partial<CreateGasStationPayload>;

export type CreateFleetRoutePayload = Omit<FleetRoute, keyof AuditableEntity>;
export type UpdateFleetRoutePayload = Partial<CreateFleetRoutePayload>;

export type CreateRefuelingPayload = Omit<Refueling, keyof AuditableEntity>;
export type UpdateRefuelingPayload = Partial<CreateRefuelingPayload>;

export type CreateFreightPayload = Omit<Freight, keyof AuditableEntity>;
export type UpdateFreightPayload = Partial<CreateFreightPayload>;

export interface CreateFreightExpensePayload {
  freightId: EntityId;
  type: FreightExpenseType;
  value: number;
  description: string;
  receiptFile?: File | null;
}

export type UpdateFreightStatusPayload = {
  freightId: EntityId;
  status: FreightStatus;
  updatedBy: string;
};
