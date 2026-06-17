import type { EntityId } from "@/types/fleet";

export type FiscalDocumentType = "CTE" | "NFE" | "MDFE";
export type FiscalDocumentStatus = "AUTORIZADO" | "CANCELADO" | "REJEITADO" | "PROCESSANDO";
export type CTeEventType = "EMISSAO" | "CANCELAMENTO" | "CARTA_CORRECAO" | "EMAIL_REENVIADO";
export type NFeType = "ENTRADA" | "SAIDA";

export interface DocumentoFiscal {
  id: EntityId;
  chaveAcesso: string;
  numero: string;
  serie: string;
  status: FiscalDocumentStatus;
  xmlUrl: string;
  pdfUrl: string;
  dataEmissao: string;
}

export interface CTeEvent {
  id: EntityId;
  type: CTeEventType;
  title: string;
  description: string;
  createdAt: string;
  createdBy: string;
}

export interface CTe extends DocumentoFiscal {
  type: "CTE";
  freteId: EntityId;
  tomadorId: EntityId;
  valorTotal: number;
  eventos: CTeEvent[];
}

export interface NFe extends DocumentoFiscal {
  type: "NFE";
  freteId?: EntityId | null;
  valorProdutos: number;
  tipo: NFeType;
}

export interface MDFe extends DocumentoFiscal {
  type: "MDFE";
  freteId?: EntityId | null;
  cteIds: EntityId[];
  nfeIds: EntityId[];
}

export interface FiscalLink {
  id: EntityId;
  freteId: EntityId;
  cteId?: EntityId | null;
  mdfeId?: EntityId | null;
  nfeIds: EntityId[];
  updatedAt: string;
}

export interface FiscalDocumentFilters {
  status: FiscalDocumentStatus | "ALL";
  startDate: string;
  endDate: string;
  tomadorId: EntityId | "ALL";
}

export interface EmitirCTePayload {
  freteId: EntityId;
  tomadorId: EntityId;
  valorTotal: number;
}

export interface CancelarCTePayload {
  cteId: EntityId;
  justificativa: string;
  updatedBy: string;
}

export interface EmitirCartaCorrecaoPayload {
  cteId: EntityId;
  correcao: string;
  updatedBy: string;
}

export interface EnviarEmailTomadorPayload {
  cteId: EntityId;
  tomadorEmail?: string;
  updatedBy: string;
}

export interface ImportarNFePayload {
  chaveAcesso?: string;
  xmlFile?: File | null;
  tipo: NFeType;
  valorProdutos?: number;
  freteId?: EntityId | null;
}

export interface VincularDocumentosFiscaisPayload {
  freteId: EntityId;
  cteId?: EntityId | null;
  mdfeId?: EntityId | null;
  nfeIds: EntityId[];
}
