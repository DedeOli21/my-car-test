import type {
  Customer,
  Driver,
  FleetRoute,
  Freight,
  FreightExpense,
  FreightTimelineEvent,
  GasStation,
  Refueling,
  Supplier,
  Vehicle,
} from "@/types/fleet";

const now = "2026-06-05T11:00:00.000Z";

export const vehiclesSeed: Vehicle[] = [
  {
    id: "vehicle-1",
    plate: "ABC1D23",
    type: "TRUCK",
    capacity: 14,
    year: 2021,
    status: "ATIVO",
    documents: [{ name: "crlv-abc1d23.pdf" }],
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "vehicle-2",
    plate: "XYZ4E56",
    type: "CARRETA",
    capacity: 30,
    year: 2020,
    status: "MANUTENCAO",
    documents: [],
    createdAt: now,
    updatedAt: now,
  },
];

export const driversSeed: Driver[] = [
  {
    id: "driver-1",
    name: "Carlos Andrade",
    cnh: "12345678900",
    cnhExpiresAt: "2027-08-12",
    phone: "(11) 99999-1000",
    employmentType: "CLT",
    documents: [{ name: "cnh-carlos.pdf" }],
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "driver-2",
    name: "Marcos Silva",
    cnh: "99887766554",
    cnhExpiresAt: "2026-12-04",
    phone: "(31) 98888-2000",
    employmentType: "AGREGADO",
    documents: [],
    createdAt: now,
    updatedAt: now,
  },
];

export const customersSeed: Customer[] = [
  {
    id: "customer-1",
    name: "Raizen Logistica",
    taxId: "12.345.678/0001-90",
    phone: "(11) 4002-8922",
    address: "Av. Paulista, 1000 - Sao Paulo/SP",
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "customer-2",
    name: "Mercado Central",
    taxId: "123.456.789-00",
    phone: "(21) 3333-4444",
    address: "Rua das Flores, 45 - Rio de Janeiro/RJ",
    createdAt: now,
    updatedAt: now,
  },
];

export const suppliersSeed: Supplier[] = [
  {
    id: "supplier-1",
    name: "Oficina Diesel Forte",
    taxId: "22.222.222/0001-22",
    serviceType: "Manutencao mecanica",
    createdAt: now,
    updatedAt: now,
  },
];

export const gasStationsSeed: GasStation[] = [
  {
    id: "gas-station-1",
    name: "Posto BR Marginal",
    cnpj: "33.333.333/0001-33",
    address: "Marginal Tiete, 500 - Sao Paulo/SP",
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "gas-station-2",
    name: "Posto RodoSul",
    cnpj: "44.444.444/0001-44",
    address: "BR-116, km 120 - Curitiba/PR",
    createdAt: now,
    updatedAt: now,
  },
];

export const fleetRoutesSeed: FleetRoute[] = [
  {
    id: "route-1",
    routeName: "SP -> RJ",
    origin: "Sao Paulo/SP",
    destination: "Rio de Janeiro/RJ",
    distanceKm: 430,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "route-2",
    routeName: "SP -> Curitiba",
    origin: "Sao Paulo/SP",
    destination: "Curitiba/PR",
    distanceKm: 410,
    createdAt: now,
    updatedAt: now,
  },
];

export const refuelingsSeed: Refueling[] = [
  {
    id: "refueling-1",
    vehicleId: "vehicle-1",
    driverId: "driver-1",
    gasStationId: "gas-station-1",
    liters: 280,
    pricePerLiter: 5.89,
    odometer: 84200,
    receipt: { name: "comprovante-abastecimento-001.jpg" },
    refueledAt: "2026-06-04T08:30",
    createdAt: now,
    updatedAt: now,
  },
];

export const freightsSeed: Freight[] = [
  {
    id: "freight-1",
    code: "FRT-0001",
    customerId: "customer-1",
    driverId: "driver-1",
    vehicleId: "vehicle-1",
    routeId: "route-1",
    origin: "Sao Paulo/SP",
    destination: "Rio de Janeiro/RJ",
    weight: 12.5,
    cargoType: "SECA",
    estimatedDeliveryAt: "2026-06-06T18:00",
    status: "AGENDADO",
    totalValue: 8500,
    margin: 18,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "freight-2",
    code: "FRT-0002",
    customerId: "customer-2",
    driverId: "driver-2",
    vehicleId: "vehicle-2",
    routeId: "route-2",
    origin: "Sao Paulo/SP",
    destination: "Curitiba/PR",
    weight: 22,
    cargoType: "REFRIGERADA",
    estimatedDeliveryAt: "2026-06-07T12:00",
    status: "EM_TRANSITO",
    totalValue: 12400,
    margin: 24,
    createdAt: now,
    updatedAt: now,
  },
];

export const freightExpensesSeed: FreightExpense[] = [
  {
    id: "freight-expense-1",
    freightId: "freight-1",
    type: "PEDAGIO",
    value: 420,
    description: "Pedágios previstos para SP -> RJ",
    receiptUrl: "/mock-storage/receipts/pedagio-frt-0001.pdf",
    createdAt: "2026-06-05T09:10:00.000Z",
  },
  {
    id: "freight-expense-2",
    freightId: "freight-2",
    type: "COMBUSTIVEL",
    value: 1850,
    description: "Abastecimento inicial da viagem",
    receiptUrl: "/mock-storage/receipts/combustivel-frt-0002.jpg",
    createdAt: "2026-06-05T10:20:00.000Z",
  },
];

export const freightTimelineSeed: FreightTimelineEvent[] = [
  {
    id: "timeline-1",
    freightId: "freight-1",
    title: "Frete agendado",
    description: "Operação criada e aguardando coleta.",
    status: "AGENDADO",
    createdAt: "2026-06-05T09:00:00.000Z",
    updatedBy: "Admin",
  },
  {
    id: "timeline-2",
    freightId: "freight-2",
    title: "Frete agendado",
    description: "Operação criada e aguardando saída.",
    status: "AGENDADO",
    createdAt: "2026-06-05T08:00:00.000Z",
    updatedBy: "Admin",
  },
  {
    id: "timeline-3",
    freightId: "freight-2",
    title: "Em trânsito",
    description: "Veículo saiu da origem e iniciou a viagem.",
    status: "EM_TRANSITO",
    createdAt: "2026-06-05T11:30:00.000Z",
    updatedBy: "Operação",
  },
];
