import type { StatusTransacaoFinanceira, TipoTransacaoFinanceira } from "@/types/financeiro";

export const tipoTransacaoOptions: Array<{ value: TipoTransacaoFinanceira; label: string }> = [
  { value: "RECEITA", label: "Receita" },
  { value: "DESPESA", label: "Despesa" },
];

export const statusTransacaoOptions: Array<{ value: StatusTransacaoFinanceira; label: string }> = [
  { value: "PENDENTE", label: "Pendente" },
  { value: "PAGO", label: "Pago" },
  { value: "ATRASADO", label: "Atrasado" },
];

export const financeiroOptionLabel = <T extends string>(
  options: Array<{ value: T; label: string }>,
  value: T
) => options.find((option) => option.value === value)?.label || value;
