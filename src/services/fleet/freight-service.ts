import { createMockRepository } from "@/services/fleet/mock-repository";
import {
  freightExpensesSeed,
  freightsSeed,
  freightTimelineSeed,
} from "@/services/fleet/seed";
import type {
  CreateFreightExpensePayload,
  CreateFreightPayload,
  Freight,
  FreightExpense,
  FreightFinancialSummary,
  FreightStatus,
  FreightTimelineEvent,
  UpdateFreightPayload,
  UpdateFreightStatusPayload,
} from "@/types/fleet";

const repository = createMockRepository<Freight>(freightsSeed);
const NETWORK_DELAY_MS = 220;

let freightExpenses = [...freightExpensesSeed];
let freightTimeline = [...freightTimelineSeed];

const wait = () => new Promise((resolve) => setTimeout(resolve, NETWORK_DELAY_MS));

const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value)) as T;

const createId = (prefix: string) => `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;

const statusTitleMap: Record<FreightStatus, string> = {
  AGENDADO: "Frete agendado",
  EM_TRANSITO: "Frete em trânsito",
  CONCLUIDO: "Frete concluído",
  CANCELADO: "Frete cancelado",
};

const receiptUrlFromFile = (freightId: string, file?: File | null) => {
  if (!file) {
    return null;
  }

  const sanitizedName = file.name.toLowerCase().replace(/[^a-z0-9.]+/g, "-");
  return `/mock-storage/freights/${freightId}/receipts/${Date.now()}-${sanitizedName}`;
};

const calculateFinancialSummary = (
  freight: Freight,
  expenses: FreightExpense[]
): FreightFinancialSummary => {
  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.value, 0);
  const netProfit = freight.totalValue - totalExpenses;

  return {
    totalValue: freight.totalValue,
    totalExpenses,
    netProfit,
    marginPercentage: freight.totalValue > 0 ? (netProfit / freight.totalValue) * 100 : 0,
  };
};

export const freightService = {
  getFreights() {
    return repository.list();
  },

  getFreight(id: string) {
    return repository.getById(id);
  },

  createFreight(payload: CreateFreightPayload) {
    return repository.create(payload);
  },

  updateFreight(id: string, payload: UpdateFreightPayload) {
    return repository.update(id, payload);
  },

  deleteFreight(id: string) {
    return repository.remove(id);
  },

  async updateFreightStatus({ freightId, status, updatedBy }: UpdateFreightStatusPayload) {
    const freight = await repository.update(freightId, { status });
    const now = new Date().toISOString();

    const timelineEvent: FreightTimelineEvent = {
      id: createId("timeline"),
      freightId,
      title: statusTitleMap[status],
      description: `Status atualizado para ${statusTitleMap[status].toLowerCase()}.`,
      status,
      createdAt: now,
      updatedBy,
    };

    freightTimeline = [timelineEvent, ...freightTimeline];
    return freight;
  },

  async getFreightExpenses(freightId: string) {
    await wait();
    return clone(
      freightExpenses
        .filter((expense) => expense.freightId === freightId)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    );
  },

  async createFreightExpense(payload: CreateFreightExpensePayload) {
    await wait();
    const expense: FreightExpense = {
      id: createId("freight-expense"),
      freightId: payload.freightId,
      type: payload.type,
      value: payload.value,
      description: payload.description,
      receiptUrl: receiptUrlFromFile(payload.freightId, payload.receiptFile),
      createdAt: new Date().toISOString(),
    };

    freightExpenses = [expense, ...freightExpenses];
    return clone(expense);
  },

  async getFreightTimeline(freightId: string) {
    await wait();
    return clone(
      freightTimeline
        .filter((event) => event.freightId === freightId)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    );
  },

  async getFreightFinancialSummary(freightId: string) {
    await wait();
    const freight = await repository.getById(freightId);

    if (!freight) {
      throw new Error("Frete não encontrado.");
    }

    const expenses = freightExpenses.filter((expense) => expense.freightId === freightId);
    return calculateFinancialSummary(freight, expenses);
  },
};
