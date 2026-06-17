import { customersSeed, freightsSeed, suppliersSeed } from "@/services/fleet/seed";
import type {
  BaixaFinanceiraPayload,
  ConciliacaoPayload,
  DRE,
  ExtratoBancario,
  FaturaConsolidada,
  FaturamentoFiltro,
  FinanceiroDREFiltros,
  FluxoCaixaItem,
  LancamentoSistema,
  TipoContaFinanceira,
  TransacaoFinanceira,
} from "@/types/financeiro";
import type { Freight } from "@/types/fleet";

const NETWORK_DELAY_MS = 260;

let transactions: TransacaoFinanceira[] = [
  {
    id: "fin-1",
    tipo: "RECEITA",
    categoria: "Frete",
    valor: 8500,
    dataVencimento: "2026-06-10",
    dataPagamento: null,
    status: "PENDENTE",
    clienteId: "customer-1",
    freteId: "freight-1",
    descricao: "Recebimento frete FRT-0001",
    contaBancaria: null,
  },
  {
    id: "fin-2",
    tipo: "RECEITA",
    categoria: "Frete",
    valor: 12400,
    dataVencimento: "2026-06-03",
    dataPagamento: null,
    status: "ATRASADO",
    clienteId: "customer-2",
    freteId: "freight-2",
    descricao: "Recebimento frete FRT-0002",
    contaBancaria: null,
  },
  {
    id: "fin-3",
    tipo: "DESPESA",
    categoria: "Combustível",
    valor: 1850,
    dataVencimento: "2026-06-07",
    dataPagamento: null,
    status: "PENDENTE",
    fornecedorId: "supplier-1",
    freteId: "freight-2",
    descricao: "Combustível viagem SP -> Curitiba",
    contaBancaria: null,
  },
  {
    id: "fin-4",
    tipo: "DESPESA",
    categoria: "Administrativo",
    valor: 2200,
    dataVencimento: "2026-06-01",
    dataPagamento: "2026-06-01",
    status: "PAGO",
    fornecedorId: "supplier-1",
    descricao: "Serviços administrativos",
    contaBancaria: "Banco do Brasil - 0001",
  },
  {
    id: "fin-5",
    tipo: "DESPESA",
    categoria: "Pedágio",
    valor: 420,
    dataVencimento: "2026-06-04",
    dataPagamento: null,
    status: "ATRASADO",
    freteId: "freight-1",
    descricao: "Pedágios viagem SP -> RJ",
    contaBancaria: null,
  },
];

let invoices: FaturaConsolidada[] = [];

let systemEntries: LancamentoSistema[] = transactions.map((transaction) => ({
  id: `sys-${transaction.id}`,
  transacaoId: transaction.id,
  descricao: transaction.descricao,
  valor: transaction.tipo === "RECEITA" ? transaction.valor : -transaction.valor,
  data: transaction.dataPagamento || transaction.dataVencimento,
  matchedBankStatementId: null,
}));

let bankStatements: ExtratoBancario[] = [
  {
    id: "bank-1",
    banco: "Banco do Brasil",
    descricao: "TED Raizen Logistica",
    valor: 8500,
    data: "2026-06-10",
    matchedSystemEntryId: null,
  },
  {
    id: "bank-2",
    banco: "Banco do Brasil",
    descricao: "Pgto combustivel",
    valor: -1850,
    data: "2026-06-07",
    matchedSystemEntryId: null,
  },
  {
    id: "bank-3",
    banco: "Itaú",
    descricao: "Servicos administrativos",
    valor: -2200,
    data: "2026-06-01",
    matchedSystemEntryId: "sys-fin-4",
  },
];

const wait = () => new Promise((resolve) => setTimeout(resolve, NETWORK_DELAY_MS));
const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value)) as T;
const createId = (prefix: string) => `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;

const isSameOrAfter = (date: string, start: string) => !start || new Date(date) >= new Date(`${start}T00:00:00`);
const isSameOrBefore = (date: string, end: string) => !end || new Date(date) <= new Date(`${end}T23:59:59`);

const getFreight = (freightId?: string) =>
  freightId ? freightsSeed.find((freight) => freight.id === freightId) : undefined;

const matchesDreFilters = (transaction: TransacaoFinanceira, filters: FinanceiroDREFiltros) => {
  const freight = getFreight(transaction.freteId);

  if (filters.customerId !== "ALL" && transaction.clienteId !== filters.customerId) return false;
  if (filters.vehicleId !== "ALL" && freight?.vehicleId !== filters.vehicleId) return false;
  if (filters.driverId !== "ALL" && freight?.driverId !== filters.driverId) return false;
  if (filters.routeId !== "ALL" && freight?.routeId !== filters.routeId) return false;

  return true;
};

const calculateDRE = (rows: TransacaoFinanceira[]): DRE => {
  const receitaBruta = rows
    .filter((transaction) => transaction.tipo === "RECEITA")
    .reduce((sum, transaction) => sum + transaction.valor, 0);
  const deducoes = receitaBruta * 0.08;
  const receitaLiquida = receitaBruta - deducoes;
  const custosOperacionais = rows
    .filter((transaction) => transaction.tipo === "DESPESA" && transaction.categoria !== "Administrativo")
    .reduce((sum, transaction) => sum + transaction.valor, 0);
  const lucroBruto = receitaLiquida - custosOperacionais;
  const despesasAdministrativas = rows
    .filter((transaction) => transaction.tipo === "DESPESA" && transaction.categoria === "Administrativo")
    .reduce((sum, transaction) => sum + transaction.valor, 0);

  return {
    receitaBruta,
    deducoes,
    receitaLiquida,
    custosOperacionais,
    lucroBruto,
    despesasAdministrativas,
    lucroLiquido: lucroBruto - despesasAdministrativas,
  };
};

const next30Days = () => {
  const today = new Date("2026-06-05T00:00:00");
  return Array.from({ length: 30 }, (_, index) => {
    const date = new Date(today);
    date.setDate(today.getDate() + index);
    return date.toISOString().slice(0, 10);
  });
};

export const financeiroService = {
  async getTransacoes(tipoConta?: TipoContaFinanceira) {
    await wait();
    const rows = transactions.filter((transaction) => {
      if (tipoConta === "PAGAR") return transaction.tipo === "DESPESA";
      if (tipoConta === "RECEBER") return transaction.tipo === "RECEITA";
      return true;
    });

    return clone(rows.sort((a, b) => new Date(a.dataVencimento).getTime() - new Date(b.dataVencimento).getTime()));
  },

  async baixarTransacao(payload: BaixaFinanceiraPayload) {
    await wait();
    const transaction = transactions.find((item) => item.id === payload.transacaoId);

    if (!transaction) {
      throw new Error("Transação não encontrada.");
    }

    const updated: TransacaoFinanceira = {
      ...transaction,
      status: "PAGO",
      dataPagamento: payload.dataPagamento,
      contaBancaria: payload.contaBancaria,
    };

    transactions = transactions.map((item) => (item.id === updated.id ? updated : item));
    systemEntries = systemEntries.map((entry) =>
      entry.transacaoId === updated.id ? { ...entry, data: payload.dataPagamento } : entry
    );

    return clone(updated);
  },

  async gerarFaturaConsolidada(filters: FaturamentoFiltro) {
    await wait();
    const completedFreights = freightsSeed.filter((freight) => {
      const matchesCustomer = filters.clienteId === "ALL" || freight.customerId === filters.clienteId;
      return (
        freight.status === "CONCLUIDO" &&
        matchesCustomer &&
        isSameOrAfter(freight.estimatedDeliveryAt, filters.dataInicio) &&
        isSameOrBefore(freight.estimatedDeliveryAt, filters.dataFim)
      );
    });

    const fallbackFreights = completedFreights.length ? completedFreights : freightsSeed.filter((freight) => {
      return filters.clienteId === "ALL" || freight.customerId === filters.clienteId;
    });

    const clienteId = filters.clienteId === "ALL" ? fallbackFreights[0]?.customerId || customersSeed[0].id : filters.clienteId;
    const invoice: FaturaConsolidada = {
      id: createId("invoice"),
      clienteId,
      freteIds: fallbackFreights.map((freight) => freight.id),
      valorTotal: fallbackFreights.reduce((sum, freight) => sum + freight.totalValue, 0),
      dataInicio: filters.dataInicio,
      dataFim: filters.dataFim,
      status: "EMITIDA",
      createdAt: new Date().toISOString(),
    };

    invoices = [invoice, ...invoices];
    return clone(invoice);
  },

  async getFaturas() {
    await wait();
    return clone(invoices);
  },

  async getConciliacao() {
    await wait();
    return clone({ systemEntries, bankStatements });
  },

  async fazerMatch(payload: ConciliacaoPayload) {
    await wait();
    systemEntries = systemEntries.map((entry) =>
      entry.id === payload.systemEntryId
        ? { ...entry, matchedBankStatementId: payload.bankStatementId }
        : entry
    );
    bankStatements = bankStatements.map((statement) =>
      statement.id === payload.bankStatementId
        ? { ...statement, matchedSystemEntryId: payload.systemEntryId }
        : statement
    );

    return clone({ systemEntries, bankStatements });
  },

  async getFluxoCaixa30Dias() {
    await wait();
    let saldoProjetado = 0;
    const items: FluxoCaixaItem[] = next30Days().map((date) => {
      const dailyTransactions = transactions.filter((transaction) => transaction.dataVencimento === date);
      const entradas = dailyTransactions
        .filter((transaction) => transaction.tipo === "RECEITA")
        .reduce((sum, transaction) => sum + transaction.valor, 0);
      const saidas = dailyTransactions
        .filter((transaction) => transaction.tipo === "DESPESA")
        .reduce((sum, transaction) => sum + transaction.valor, 0);
      saldoProjetado += entradas - saidas;
      return { data: date, entradas, saidas, saldoProjetado };
    });

    return clone(items);
  },

  async getDRE(filters: FinanceiroDREFiltros) {
    await wait();
    return clone(calculateDRE(transactions.filter((transaction) => matchesDreFilters(transaction, filters))));
  },

  async exportarRelatorio(format: "excel" | "pdf", reportName: string) {
    await wait();
    console.log(`[mock-export] ${reportName}.${format}`);
    return {
      fileName: `${reportName}.${format === "excel" ? "xlsx" : "pdf"}`,
      url: `/mock-storage/reports/${reportName}.${format === "excel" ? "xlsx" : "pdf"}`,
    };
  },
};
