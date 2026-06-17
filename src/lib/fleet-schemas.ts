import { z } from "zod";
import {
  cargoTypeOptions,
  driverEmploymentOptions,
  freightExpenseTypeOptions,
  freightStatusOptions,
  vehicleStatusOptions,
  vehicleTypeOptions,
} from "@/lib/fleet-options";

const enumValues = <T extends string>(options: Array<{ value: T }>) =>
  options.map((option) => option.value) as [T, ...T[]];

const requiredString = (message: string) => z.string().trim().min(1, message);
const positiveNumber = (message: string) => z.coerce.number().positive(message);
const nonNegativeNumber = (message: string) => z.coerce.number().min(0, message);
const positiveInteger = (message: string) => z.coerce.number().int().positive(message);

export const vehicleFormSchema = z.object({
  // A placa deve ser única no backend; aqui validamos apenas preenchimento e formato mínimo.
  plate: requiredString("Informe a placa.").min(7, "A placa deve ter ao menos 7 caracteres."),
  type: z.enum(enumValues(vehicleTypeOptions)),
  capacity: positiveNumber("Informe a capacidade."),
  year: z.coerce.number().int().min(1950, "Ano inválido.").max(2100, "Ano inválido."),
  status: z.enum(enumValues(vehicleStatusOptions)),
  documents: z.any().optional(),
});

export const driverFormSchema = z.object({
  name: requiredString("Informe o nome do motorista."),
  // A CNH deve ser única no backend; aqui validamos apenas tamanho básico.
  cnh: requiredString("Informe a CNH.").min(6, "CNH inválida."),
  cnhExpiresAt: requiredString("Informe a validade da CNH."),
  phone: requiredString("Informe o telefone."),
  employmentType: z.enum(enumValues(driverEmploymentOptions)),
  documents: z.any().optional(),
});

export const customerFormSchema = z.object({
  name: requiredString("Informe o nome do cliente."),
  taxId: requiredString("Informe CPF/CNPJ."),
  phone: requiredString("Informe o telefone."),
  address: requiredString("Informe o endereço."),
});

export const supplierFormSchema = z.object({
  name: requiredString("Informe o nome do fornecedor."),
  taxId: requiredString("Informe CPF/CNPJ."),
  serviceType: requiredString("Informe o tipo de serviço."),
});

export const gasStationFormSchema = z.object({
  name: requiredString("Informe o nome do posto."),
  cnpj: requiredString("Informe o CNPJ."),
  address: requiredString("Informe o endereço."),
});

export const fleetRouteFormSchema = z.object({
  routeName: requiredString("Informe o nome da rota."),
  origin: requiredString("Informe a origem."),
  destination: requiredString("Informe o destino."),
  distanceKm: positiveNumber("Informe a distância em km."),
});

export const refuelingFormSchema = z.object({
  vehicleId: requiredString("Selecione o veículo."),
  driverId: requiredString("Selecione o motorista."),
  gasStationId: requiredString("Selecione o posto."),
  liters: positiveNumber("Informe a quantidade de litros."),
  pricePerLiter: positiveNumber("Informe o preço por litro."),
  odometer: positiveInteger("Informe o hodômetro."),
  receipt: z.any().optional(),
  refueledAt: requiredString("Informe a data do abastecimento."),
});

export const freightFormSchema = z.object({
  code: requiredString("Informe o código do frete."),
  customerId: requiredString("Selecione o cliente."),
  driverId: requiredString("Selecione o motorista."),
  vehicleId: requiredString("Selecione o veículo."),
  routeId: z.string().optional(),
  origin: requiredString("Informe a origem."),
  destination: requiredString("Informe o destino."),
  weight: positiveNumber("Informe o peso."),
  cargoType: z.enum(enumValues(cargoTypeOptions)),
  estimatedDeliveryAt: requiredString("Informe a previsão de entrega."),
  status: z.enum(enumValues(freightStatusOptions)),
  totalValue: positiveNumber("Informe o valor bruto do frete."),
  margin: nonNegativeNumber("Informe uma margem maior ou igual a zero."),
});

export const freightExpenseFormSchema = z.object({
  type: z.enum(enumValues(freightExpenseTypeOptions)),
  value: positiveNumber("Informe o valor da despesa."),
  description: requiredString("Informe uma descrição."),
  receiptFile: z.any().optional(),
});

export type VehicleFormValues = z.infer<typeof vehicleFormSchema>;
export type DriverFormValues = z.infer<typeof driverFormSchema>;
export type CustomerFormValues = z.infer<typeof customerFormSchema>;
export type SupplierFormValues = z.infer<typeof supplierFormSchema>;
export type GasStationFormValues = z.infer<typeof gasStationFormSchema>;
export type FleetRouteFormValues = z.infer<typeof fleetRouteFormSchema>;
export type RefuelingFormValues = z.infer<typeof refuelingFormSchema>;
export type FreightFormValues = z.infer<typeof freightFormSchema>;
export type FreightExpenseFormValues = z.infer<typeof freightExpenseFormSchema>;
