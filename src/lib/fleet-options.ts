import type {
  CargoType,
  DriverEmploymentType,
  FreightExpenseType,
  FreightStatus,
  VehicleStatus,
  VehicleType,
} from "@/types/fleet";

export const vehicleTypeOptions: Array<{ value: VehicleType; label: string }> = [
  { value: "TOCO", label: "Toco" },
  { value: "TRUCK", label: "Truck" },
  { value: "CARRETA", label: "Carreta" },
];

export const vehicleStatusOptions: Array<{ value: VehicleStatus; label: string }> = [
  { value: "ATIVO", label: "Ativo" },
  { value: "MANUTENCAO", label: "Manutenção" },
  { value: "INATIVO", label: "Inativo" },
];

export const driverEmploymentOptions: Array<{ value: DriverEmploymentType; label: string }> = [
  { value: "CLT", label: "CLT" },
  { value: "TERCEIRIZADO", label: "Terceirizado" },
  { value: "AGREGADO", label: "Agregado" },
];

export const cargoTypeOptions: Array<{ value: CargoType; label: string }> = [
  { value: "SECA", label: "Seca" },
  { value: "REFRIGERADA", label: "Refrigerada" },
  { value: "PERIGOSA", label: "Perigosa" },
];

export const freightStatusOptions: Array<{ value: FreightStatus; label: string }> = [
  { value: "AGENDADO", label: "Agendado" },
  { value: "EM_TRANSITO", label: "Em Trânsito" },
  { value: "CONCLUIDO", label: "Concluído" },
  { value: "CANCELADO", label: "Cancelado" },
];

export const freightExpenseTypeOptions: Array<{ value: FreightExpenseType; label: string }> = [
  { value: "PEDAGIO", label: "Pedágio" },
  { value: "COMBUSTIVEL", label: "Combustível" },
  { value: "DIARIA", label: "Diária" },
  { value: "MANUTENCAO", label: "Manutenção" },
  { value: "COMISSAO", label: "Comissão" },
  { value: "OUTROS", label: "Outros" },
];

export const optionLabel = <T extends string>(
  options: Array<{ value: T; label: string }>,
  value: T
) => options.find((option) => option.value === value)?.label || value;
