import type { EntityId } from "@/types/fleet";

export type TipoTransacaoFinanceira = "RECEITA" | "DESPESA";
export type StatusTransacaoFinanceira = "PENDENTE" | "PAGO" | "ATRASADO";
export type TipoContaFinanceira = "PAGAR" | "RECEBER";

export interface TransacaoFinanceira {
  id: EntityId;
  tipo: TipoTransacaoFinanceira;
  categoria: string;
  valor: number;
  dataVencimento: string;
  dataPagamento: string | null;
  status: StatusTransacaoFinanceira;
  clienteId?: EntityId;
  fornecedorId?: EntityId;
  freteId?: EntityId;
  descricao: string;
  contaBancaria?: string | null;
}

export interface DRE {
  receitaBruta: number;
  deducoes: number;
  receitaLiquida: number;
  custosOperacionais: number;
  lucroBruto: number;
  despesasAdministrativas: number;
  lucroLiquido: number;
}

export interface FinanceiroDREFiltros {
  vehicleId: EntityId | "ALL";
  driverId: EntityId | "ALL";
  customerId: EntityId | "ALL";
  routeId: EntityId | "ALL";
}

export interface BaixaFinanceiraPayload {
  transacaoId: EntityId;
  dataPagamento: string;
  contaBancaria: string;
}

export interface FaturamentoFiltro {
  clienteId: EntityId | "ALL";
  dataInicio: string;
  dataFim: string;
}

export interface FaturaConsolidada {
  id: EntityId;
  clienteId: EntityId;
  freteIds: EntityId[];
  valorTotal: number;
  dataInicio: string;
  dataFim: string;
  status: "RASCUNHO" | "EMITIDA";
  createdAt: string;
}

export interface LancamentoSistema {
  id: EntityId;
  transacaoId: EntityId;
  descricao: string;
  valor: number;
  data: string;
  matchedBankStatementId?: EntityId | null;
}

export interface ExtratoBancario {
  id: EntityId;
  banco: string;
  descricao: string;
  valor: number;
  data: string;
  matchedSystemEntryId?: EntityId | null;
}

export interface ConciliacaoPayload {
  systemEntryId: EntityId;
  bankStatementId: EntityId;
}

export interface FluxoCaixaItem {
  data: string;
  entradas: number;
  saidas: number;
  saldoProjetado: number;
}
