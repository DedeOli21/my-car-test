import { useQuery } from "@tanstack/react-query";
import { AlertTriangle, DollarSign, Fuel, Truck } from "lucide-react";
import StatusBlock from "@/components/app/StatusBlock";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";
import { getFriendlyErrorMessage } from "@/lib/error-messages";
import { toAppError } from "@/lib/errors";
import { formatCurrency, formatDate } from "@/lib/format";
import { queryKeys } from "@/lib/query-keys";
import { financeService } from "@/services/finance-service";
import { transactionsService } from "@/services/transactions-service";

const Dashboard = () => {
  const { user } = useAuth();

  const balanceQuery = useQuery({
    queryKey: queryKeys.balance,
    queryFn: financeService.getBalance,
  });

  const transactionsQuery = useQuery({
    queryKey: queryKeys.transactions,
    queryFn: transactionsService.list,
  });

  if (balanceQuery.isLoading || transactionsQuery.isLoading) {
    return (
      <div className="p-4">
        <StatusBlock
          title="Carregando dashboard"
          description="Estamos buscando seus dados financeiros."
          isLoading
        />
      </div>
    );
  }

  if (balanceQuery.isError || transactionsQuery.isError) {
    const error = toAppError(balanceQuery.error || transactionsQuery.error);
    return (
      <div className="p-4">
        <StatusBlock
          title="Falha ao carregar dashboard"
          description={getFriendlyErrorMessage(error)}
          onRetry={() => {
            balanceQuery.refetch();
            transactionsQuery.refetch();
          }}
        />
      </div>
    );
  }

  const balance = balanceQuery.data;
  const transactions = transactionsQuery.data;
  const fuelTransactions = transactions.filter((item) => item.type === "FUEL");
  const freightTransactions = transactions.filter((item) => item.type === "FREIGHT");

  const totalFuel = fuelTransactions.reduce((sum, item) => sum + item.amount, 0);
  const totalFreight = freightTransactions.reduce((sum, item) => sum + item.amount, 0);
  const latest = transactions[0];

  return (
    <div className="p-4 space-y-4">
      <div className="space-y-1">
        <p className="text-sm text-muted-foreground">Olá,</p>
        <h1 className="text-2xl font-bold text-foreground">{user?.name || user?.email || "Motorista"}</h1>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Saldo Total Disponível</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold text-primary">{formatCurrency(balance.totalAvailable)}</p>
          <p className="text-sm text-muted-foreground mt-2">
            Carteira: {formatCurrency(balance.walletBalance)} | Open Banking: {formatCurrency(balance.openBankingBalance)}
          </p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-3">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4 text-primary" />
              <p className="text-sm text-muted-foreground">Fretes</p>
            </div>
            <p className="text-xl font-semibold mt-2">{formatCurrency(totalFreight)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Fuel className="w-4 h-4 text-primary" />
              <p className="text-sm text-muted-foreground">Abastecimento</p>
            </div>
            <p className="text-xl font-semibold mt-2">{formatCurrency(totalFuel)}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Última Transação</CardTitle>
        </CardHeader>
        <CardContent>
          {latest ? (
            <div className="space-y-1">
              <p className="font-semibold">{latest.description}</p>
              <p className="text-sm text-muted-foreground">{formatDate(latest.createdAt)} • {latest.type}</p>
              <p className="text-lg font-bold">{formatCurrency(latest.amount)}</p>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-muted-foreground text-sm">
              <AlertTriangle className="w-4 h-4" />
              Nenhuma transação encontrada.
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4 flex items-center gap-2 text-sm text-muted-foreground">
          <DollarSign className="w-4 h-4" />
          Dados sincronizados em tempo real com o backend.
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
