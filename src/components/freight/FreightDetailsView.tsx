import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CalendarClock, FileText, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  cargoTypeOptions,
  freightExpenseTypeOptions,
  freightStatusOptions,
  optionLabel,
} from "@/lib/fleet-options";
import { freightExpenseFormSchema, type FreightExpenseFormValues } from "@/lib/fleet-schemas";
import { formatCurrency } from "@/lib/format";
import type {
  CreateFreightExpensePayload,
  Customer,
  Driver,
  FleetRoute,
  Freight,
  FreightExpense,
  FreightFinancialSummary,
  FreightTimelineEvent,
  GasStation,
  Vehicle,
} from "@/types/fleet";

interface FreightDetailsViewProps {
  freight: Freight;
  customer?: Customer;
  driver?: Driver;
  vehicle?: Vehicle;
  route?: FleetRoute;
  expenses: FreightExpense[];
  timeline: FreightTimelineEvent[];
  financialSummary: FreightFinancialSummary;
  expenseDialogOpen: boolean;
  isSavingExpense: boolean;
  onExpenseDialogOpenChange: (open: boolean) => void;
  onCreateExpense: (payload: CreateFreightExpensePayload) => Promise<void>;
}

const getFileList = (value: unknown): FileList | null => {
  if (typeof FileList !== "undefined" && value instanceof FileList) {
    return value;
  }

  return null;
};

const formatDateTime = (value: string) => {
  if (!value) {
    return "-";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  });
};

const MetricCard = ({
  title,
  value,
  tone = "default",
}: {
  title: string;
  value: string;
  tone?: "default" | "success" | "danger";
}) => {
  const toneClass =
    tone === "success"
      ? "text-green-500"
      : tone === "danger"
        ? "text-destructive"
        : "text-primary";

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm text-muted-foreground">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className={`text-2xl font-bold ${toneClass}`}>{value}</p>
      </CardContent>
    </Card>
  );
};

const ExpenseFormDialog = ({
  freightId,
  open,
  isSaving,
  onOpenChange,
  onCreateExpense,
}: {
  freightId: string;
  open: boolean;
  isSaving: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateExpense: (payload: CreateFreightExpensePayload) => Promise<void>;
}) => {
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<FreightExpenseFormValues>({
    resolver: zodResolver(freightExpenseFormSchema),
    values: {
      type: "PEDAGIO",
      value: 0,
      description: "",
      receiptFile: undefined,
    },
  });

  const submit = async (values: FreightExpenseFormValues) => {
    const fileList = getFileList(values.receiptFile);
    await onCreateExpense({
      freightId,
      type: values.type,
      value: values.value,
      description: values.description.trim(),
      receiptFile: fileList?.[0] || null,
    });
    reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Lançar Despesa</DialogTitle>
          <DialogDescription>
            Vincule uma despesa operacional ao frete e anexe o comprovante quando houver.
          </DialogDescription>
        </DialogHeader>

        <form className="grid gap-4" onSubmit={handleSubmit(submit)}>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Tipo</Label>
              <Controller
                control={control}
                name="type"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      {freightExpenseTypeOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.type?.message ? <p className="text-xs text-destructive">{errors.type.message}</p> : null}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="expense-value">Valor</Label>
              <Input id="expense-value" type="number" step="0.01" {...register("value")} />
              {errors.value?.message ? <p className="text-xs text-destructive">{errors.value.message}</p> : null}
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="expense-description">Descrição</Label>
              <Input id="expense-description" {...register("description")} placeholder="Ex.: Pedágio Régis Bittencourt" />
              {errors.description?.message ? (
                <p className="text-xs text-destructive">{errors.description.message}</p>
              ) : null}
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="expense-receipt">Comprovante</Label>
              <Input id="expense-receipt" type="file" accept="image/*,.pdf" {...register("receiptFile")} />
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? "Salvando..." : "Salvar despesa"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

const FreightDetailsView = ({
  freight,
  customer,
  driver,
  vehicle,
  route,
  expenses,
  timeline,
  financialSummary,
  expenseDialogOpen,
  isSavingExpense,
  onExpenseDialogOpenChange,
  onCreateExpense,
}: FreightDetailsViewProps) => {
  const marginTone = financialSummary.marginPercentage >= 20 ? "success" : financialSummary.marginPercentage < 8 ? "danger" : "default";

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-muted-foreground">Frete</p>
          <h2 className="text-xl font-bold">{freight.code}</h2>
        </div>
        <Badge variant="secondary">{optionLabel(freightStatusOptions, freight.status)}</Badge>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="h-auto flex-wrap justify-start">
          <TabsTrigger value="overview">Operação</TabsTrigger>
          <TabsTrigger value="financial">Financeiro</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Cliente e Rota</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <p><span className="text-muted-foreground">Cliente:</span> {customer?.name || "-"}</p>
                <p><span className="text-muted-foreground">Origem:</span> {freight.origin}</p>
                <p><span className="text-muted-foreground">Destino:</span> {freight.destination}</p>
                <p><span className="text-muted-foreground">Rota padrão:</span> {route?.routeName || "Sem rota vinculada"}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Veículo e Motorista</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <p><span className="text-muted-foreground">Motorista:</span> {driver?.name || "-"}</p>
                <p><span className="text-muted-foreground">Veículo:</span> {vehicle?.plate || "-"}</p>
                <p><span className="text-muted-foreground">Tipo do veículo:</span> {vehicle?.type || "-"}</p>
                <p><span className="text-muted-foreground">Capacidade:</span> {vehicle ? `${vehicle.capacity} t` : "-"}</p>
              </CardContent>
            </Card>

            <Card className="sm:col-span-2">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Carga e Entrega</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-2 text-sm sm:grid-cols-3">
                <p><span className="text-muted-foreground">Tipo de carga:</span> {optionLabel(cargoTypeOptions, freight.cargoType)}</p>
                <p><span className="text-muted-foreground">Peso:</span> {freight.weight} t</p>
                <p className="flex items-center gap-1">
                  <CalendarClock className="h-4 w-4 text-muted-foreground" />
                  {formatDateTime(freight.estimatedDeliveryAt)}
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="financial" className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <MetricCard title="Faturamento Bruto" value={formatCurrency(financialSummary.totalValue)} />
            <MetricCard title="Despesas Acumuladas" value={formatCurrency(financialSummary.totalExpenses)} tone="danger" />
            <MetricCard
              title="Lucro Líquido Real"
              value={formatCurrency(financialSummary.netProfit)}
              tone={financialSummary.netProfit >= 0 ? "success" : "danger"}
            />
            <MetricCard title="Margem de Lucro" value={`${financialSummary.marginPercentage.toFixed(2)}%`} tone={marginTone} />
          </div>

          <Card>
            <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <CardTitle className="text-base">Despesas Vinculadas</CardTitle>
              <Button type="button" className="gap-2" onClick={() => onExpenseDialogOpenChange(true)}>
                <Plus className="h-4 w-4" />
                Lançar despesa
              </Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Descrição</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead className="text-right">Comprovante</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {expenses.length ? (
                    expenses.map((expense) => (
                      <TableRow key={expense.id}>
                        <TableCell>{optionLabel(freightExpenseTypeOptions, expense.type)}</TableCell>
                        <TableCell>{expense.description}</TableCell>
                        <TableCell>{formatCurrency(expense.value)}</TableCell>
                        <TableCell>{formatDateTime(expense.createdAt)}</TableCell>
                        <TableCell className="text-right">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            disabled={!expense.receiptUrl}
                            onClick={() => expense.receiptUrl && window.open(expense.receiptUrl, "_blank")}
                            className="gap-2"
                          >
                            <FileText className="h-4 w-4" />
                            Abrir
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                        Nenhuma despesa vinculada a este frete.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="timeline">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Histórico da Operação</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {timeline.length ? (
                  timeline.map((event) => (
                    <div key={event.id} className="relative border-l border-border pl-4">
                      <div className="absolute -left-[5px] top-1 h-2.5 w-2.5 rounded-full bg-primary" />
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-semibold">{event.title}</p>
                          <Badge variant="secondary">{optionLabel(freightStatusOptions, event.status)}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{event.description}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatDateTime(event.createdAt)} por {event.updatedBy}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">Nenhum evento registrado.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <ExpenseFormDialog
        freightId={freight.id}
        open={expenseDialogOpen}
        isSaving={isSavingExpense}
        onOpenChange={onExpenseDialogOpenChange}
        onCreateExpense={onCreateExpense}
      />
    </div>
  );
};

export default FreightDetailsView;
