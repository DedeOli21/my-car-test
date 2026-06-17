export const brlFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

export const dateFormatter = new Intl.DateTimeFormat("pt-BR", {
  dateStyle: "short",
});

export const formatBRL = (value: number) => brlFormatter.format(value);

export const formatShortDate = (value: string) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : dateFormatter.format(date);
};
