import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import StatusBlock from "@/components/app/StatusBlock";
import BaixaFinanceiraModal from "@/components/financeiro/BaixaFinanceiraModal";
import BankReconciliationPanel from "@/components/financeiro/BankReconciliationPanel";
import CashFlowChart from "@/components/financeiro/CashFlowChart";
import ClientBillingPanel from "@/components/financeiro/ClientBillingPanel";
import DREReport from "@/components/financeiro/DREReport";
import FinanceAccountsTable from "@/components/financeiro/FinanceAccountsTable";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { getFriendlyErrorMessage } from "@/lib/error-messages";
import { toAppError } from "@/lib/errors";
import { queryKeys } from "@/lib/query-keys";
import { customerService } from "@/services/fleet/customer-service";
import { driverService } from "@/services/fleet/driver-service";
import { fleetRouteService } from "@/services/fleet/fleet-route-service";
import { freightService } from "@/services/fleet/freight-service";
import { supplierService } from "@/services/fleet/supplier-service";
import { vehicleService } from "@/services/fleet/vehicle-service";
import { financeiroService } from "@/services/financeiro-service";
import type {
  BaixaFinanceiraPayload,
  ConciliacaoPayload,
  FaturamentoFiltro,
  FinanceiroDREFiltros,
  TransacaoFinanceira,
} from "@/types/financeiro";

const initialDreFilters: FinanceiroDREFiltros = {
  vehicleId: "ALL",
  driverId: "ALL",
  customerId: "ALL",
  routeId: "ALL",
};

const AdminFinancialModule = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [settlementTransaction, setSettlementTransaction] = useState<TransacaoFinanceira | null>(null);
  const [selectedSystemEntryId, setSelectedSystemEntryId] = useState<string | null>(null);
  const [selectedBankStatementId, setSelectedBankStatementId] = useState<string | null>(null);
  const [dreFilters, setDreFilters] = useState<FinanceiroDREFiltros>(initialDreFilters);

  const payablesQuery = useQuery({
    queryKey: [...queryKeys.financialTransactions, "payables"],
    queryFn: () => financeiroService.getTransacoes("PAGAR"),
  });
  const receivablesQuery = useQuery({
    queryKey: [...queryKeys.financialTransactions, "receivables"],
    queryFn: () => financeiroService.getTransacoes("RECEBER"),
  });
  const invoicesQuery = useQuery({
    queryKey: queryKeys.invoices,
    queryFn: financeiroService.getFaturas,
  });
  const reconciliationQuery = useQuery({
    queryKey: queryKeys.bankReconciliation,
    queryFn: financeiroService.getConciliacao,
  });
  const cashFlowQuery = useQuery({
    queryKey: queryKeys.cashFlow,
    queryFn: financeiroService.getFluxoCaixa30Dias,
  });
  const dreQuery = useQuery({
    queryKey: queryKeys.dre(dreFilters),
    queryFn: () => financeiroService.getDRE(dreFilters),
  });

  const customersQuery = useQuery({ queryKey: queryKeys.customers, queryFn: customerService.getCustomers });
  const suppliersQuery = useQuery({ queryKey: queryKeys.suppliers, queryFn: supplierService.getSuppliers });
  const freightsQuery = useQuery({ queryKey: queryKeys.freights, queryFn: freightService.getFreights });
  const vehiclesQuery = useQuery({ queryKey: queryKeys.vehicles, queryFn: vehicleService.getVehicles });
  const driversQuery = useQuery({ queryKey: queryKeys.drivers, queryFn: driverService.getDrivers });
  const routesQuery = useQuery({ queryKey: queryKeys.fleetRoutes, queryFn: fleetRouteService.getRoutes });

  const invalidateFinancial = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: queryKeys.financialTransactions }),
      queryClient.invalidateQueries({ queryKey: queryKeys.bankReconciliation }),
      queryClient.invalidateQueries({ queryKey: queryKeys.cashFlow }),
      queryClient.invalidateQueries({ queryKey: queryKeys.invoices }),
      queryClient.invalidateQueries({ queryKey: ["admin-financeiro", "dre"] }),
    ]);
  };

  const settlementMutation = useMutation({
    mutationFn: (payload: BaixaFinanceiraPayload) => financeiroService.baixarTransacao(payload),
    onSuccess: async () => {
      setSettlementTransaction(null);
      await invalidateFinancial();
      toast({ title: "Baixa registrada", description: "Pagamento/recebimento baixado com sucesso." });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Falha na baixa",
        description: getFriendlyErrorMessage(toAppError(error)),
      });
    },
  });

  const invoiceMutation = useMutation({
    mutationFn: (filters: FaturamentoFiltro) => financeiroService.gerarFaturaConsolidada(filters),
    onSuccess: async (invoice) => {
      await invalidateFinancial();
      toast({ title: "Fatura gerada", description: `Fatura consolidada de ${invoice.freteIds.length} frete(s).` });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Falha ao gerar fatura",
        description: getFriendlyErrorMessage(toAppError(error)),
      });
    },
  });

  const matchMutation = useMutation({
    mutationFn: (payload: ConciliacaoPayload) => financeiroService.fazerMatch(payload),
    onSuccess: async () => {
      setSelectedSystemEntryId(null);
      setSelectedBankStatementId(null);
      await invalidateFinancial();
      toast({ title: "Conciliação realizada", description: "Lançamento e extrato vinculados." });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Falha na conciliação",
        description: getFriendlyErrorMessage(toAppError(error)),
      });
    },
  });

  const exportMutation = useMutation({
    mutationFn: ({ format, reportName }: { format: "excel" | "pdf"; reportName: string }) =>
      financeiroService.exportarRelatorio(format, reportName),
    onSuccess: (file) => {
      toast({ title: "Exportação mockada", description: `${file.fileName} gerado em ${file.url}.` });
    },
  });

  const payables = useMemo(() => payablesQuery.data || [], [payablesQuery.data]);
  const receivables = useMemo(() => receivablesQuery.data || [], [receivablesQuery.data]);
  const invoices = useMemo(() => invoicesQuery.data || [], [invoicesQuery.data]);
  const reconciliation = reconciliationQuery.data || { systemEntries: [], bankStatements: [] };
  const cashFlow = useMemo(() => cashFlowQuery.data || [], [cashFlowQuery.data]);
  const customers = useMemo(() => customersQuery.data || [], [customersQuery.data]);
  const suppliers = useMemo(() => suppliersQuery.data || [], [suppliersQuery.data]);
  const freights = useMemo(() => freightsQuery.data || [], [freightsQuery.data]);
  const vehicles = useMemo(() => vehiclesQuery.data || [], [vehiclesQuery.data]);
  const drivers = useMemo(() => driversQuery.data || [], [driversQuery.data]);
  const routes = useMemo(() => routesQuery.data || [], [routesQuery.data]);

  const isLoading =
    payablesQuery.isLoading ||
    receivablesQuery.isLoading ||
    invoicesQuery.isLoading ||
    reconciliationQuery.isLoading ||
    cashFlowQuery.isLoading ||
    dreQuery.isLoading ||
    customersQuery.isLoading ||
    suppliersQuery.isLoading ||
    freightsQuery.isLoading ||
    vehiclesQuery.isLoading ||
    driversQuery.isLoading ||
    routesQuery.isLoading;

  const error =
    payablesQuery.error ||
    receivablesQuery.error ||
    invoicesQuery.error ||
    reconciliationQuery.error ||
    cashFlowQuery.error ||
    dreQuery.error ||
    customersQuery.error ||
    suppliersQuery.error ||
    freightsQuery.error ||
    vehiclesQuery.error ||
    driversQuery.error ||
    routesQuery.error;

  const exportReport = (reportName: string, format: "excel" | "pdf") => {
    exportMutation.mutate({ reportName, format });
  };

  if (isLoading) {
    return (
      <div className="p-4">
        <StatusBlock title="Carregando módulo financeiro" isLoading />
      </div>
    );
  }

  if (error || !dreQuery.data) {
    return (
      <div className="p-4">
        <StatusBlock
          title="Falha ao carregar módulo financeiro"
          description={getFriendlyErrorMessage(toAppError(error))}
          onRetry={() => {
            payablesQuery.refetch();
            receivablesQuery.refetch();
            invoicesQuery.refetch();
            reconciliationQuery.refetch();
            cashFlowQuery.refetch();
            dreQuery.refetch();
          }}
        />
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4 pb-24">
      <div className="space-y-1">
        <p className="text-sm text-muted-foreground">Admin</p>
        <h1 className="text-2xl font-bold">Módulo Financeiro</h1>
      </div>

      <Tabs defaultValue="payables" className="space-y-4">
        <TabsList className="h-auto flex-wrap justify-start">
          <TabsTrigger value="payables">A Pagar</TabsTrigger>
          <TabsTrigger value="receivables">A Receber</TabsTrigger>
          <TabsTrigger value="billing">Faturamento</TabsTrigger>
          <TabsTrigger value="reconciliation">Conciliação</TabsTrigger>
          <TabsTrigger value="cashflow">Fluxo de Caixa</TabsTrigger>
          <TabsTrigger value="dre">DRE</TabsTrigger>
        </TabsList>

        <TabsContent value="payables">
          <FinanceAccountsTable
            title="Contas a Pagar"
            rows={payables}
            customers={customers}
            suppliers={suppliers}
            freights={freights}
            actionLabel="Baixar Pagamento"
            onSettle={setSettlementTransaction}
            onExport={(format) => exportReport("contas-a-pagar", format)}
          />
        </TabsContent>

        <TabsContent value="receivables">
          <FinanceAccountsTable
            title="Contas a Receber"
            rows={receivables}
            customers={customers}
            suppliers={suppliers}
            freights={freights}
            actionLabel="Baixar Recebimento"
            onSettle={setSettlementTransaction}
            onExport={(format) => exportReport("contas-a-receber", format)}
          />
        </TabsContent>

        <TabsContent value="billing">
          <ClientBillingPanel
            customers={customers}
            freights={freights}
            invoices={invoices}
            isSubmitting={invoiceMutation.isPending}
            onGenerateInvoice={(filters) => invoiceMutation.mutateAsync(filters)}
            onExport={(format) => exportReport("faturamento-clientes", format)}
          />
        </TabsContent>

        <TabsContent value="reconciliation">
          <BankReconciliationPanel
            systemEntries={reconciliation.systemEntries}
            bankStatements={reconciliation.bankStatements}
            selectedSystemEntryId={selectedSystemEntryId}
            selectedBankStatementId={selectedBankStatementId}
            isSubmitting={matchMutation.isPending}
            onSelectSystemEntry={setSelectedSystemEntryId}
            onSelectBankStatement={setSelectedBankStatementId}
            onMatch={(payload) => matchMutation.mutateAsync(payload)}
          />
        </TabsContent>

        <TabsContent value="cashflow">
          <CashFlowChart data={cashFlow} />
        </TabsContent>

        <TabsContent value="dre">
          <DREReport
            dre={dreQuery.data}
            filters={dreFilters}
            vehicles={vehicles}
            drivers={drivers}
            customers={customers}
            routes={routes}
            onFiltersChange={setDreFilters}
            onExport={(format) => exportReport("dre", format)}
          />
        </TabsContent>
      </Tabs>

      <BaixaFinanceiraModal
        transaction={settlementTransaction}
        open={Boolean(settlementTransaction)}
        isSubmitting={settlementMutation.isPending}
        onOpenChange={(open) => !open && setSettlementTransaction(null)}
        onSubmit={(payload) => settlementMutation.mutateAsync(payload)}
      />
    </div>
  );
};

export default AdminFinancialModule;
