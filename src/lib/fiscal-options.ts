import type { CTeEventType, FiscalDocumentStatus, NFeType } from "@/types/fiscal";

export const fiscalStatusOptions: Array<{ value: FiscalDocumentStatus; label: string }> = [
  { value: "AUTORIZADO", label: "Autorizado" },
  { value: "CANCELADO", label: "Cancelado" },
  { value: "REJEITADO", label: "Rejeitado" },
  { value: "PROCESSANDO", label: "Processando" },
];

export const nfeTypeOptions: Array<{ value: NFeType; label: string }> = [
  { value: "ENTRADA", label: "Entrada" },
  { value: "SAIDA", label: "Saída" },
];

export const cteEventTypeOptions: Array<{ value: CTeEventType; label: string }> = [
  { value: "EMISSAO", label: "Emissão" },
  { value: "CANCELAMENTO", label: "Cancelamento" },
  { value: "CARTA_CORRECAO", label: "Carta de Correção" },
  { value: "EMAIL_REENVIADO", label: "E-mail reenviado" },
];

export const fiscalOptionLabel = <T extends string>(
  options: Array<{ value: T; label: string }>,
  value: T
) => options.find((option) => option.value === value)?.label || value;
