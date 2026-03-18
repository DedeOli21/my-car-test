import { FormEvent, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import StatusBlock from "@/components/app/StatusBlock";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { getFriendlyErrorMessage } from "@/lib/error-messages";
import { toAppError } from "@/lib/errors";
import { formatCurrency, formatDate } from "@/lib/format";
import { queryKeys } from "@/lib/query-keys";
import { financeService } from "@/services/finance-service";
import { payablesService } from "@/services/payables-service";

const Financeiro = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { role } = useAuth();

  const [provider, setProvider] = useState("Banco do Brasil");
  const [availableBalance, setAvailableBalance] = useState("");

  const balanceQuery = useQuery({
    queryKey: queryKeys.balance,
    queryFn: financeService.getBalance,
  });

  const payablesQuery = useQuery({
    queryKey: queryKeys.payables,
    queryFn: payablesService.list,
  });

  const payMutation = useMutation({
    mutationFn: payablesService.pay,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.payables });
      await queryClient.invalidateQueries({ queryKey: queryKeys.transactions });
      await queryClient.invalidateQueries({ queryKey: queryKeys.balance });
      toast({
        title: "Conta paga",
        description: "Pagamento realizado com sucesso.",
      });
    },
    onError: (error) => {
      const parsed = toAppError(error);
      toast({
        variant: "destructive",
        title: "Falha no pagamento",
        description: getFriendlyErrorMessage(parsed),
      });
    },
  });

  const syncMutation = useMutation({
    mutationFn: financeService.syncOpenBanking,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.balance });
      toast({
        title: "Open Banking sincronizado",
        description: "Saldo externo atualizado com sucesso.",
      });
    },
    onError: (error) => {
      const parsed = toAppError(error);
      toast({
        variant: "destructive",
        title: "Falha na sincronização",
        description: getFriendlyErrorMessage(parsed),
      });
    },
  });

  const pendingPayables = useMemo(() => {
    if (!payablesQuery.data) {
      return [];
    }

    return payablesQuery.data.filter((item) => item.status !== "PAID");
  }, [payablesQuery.data]);

  const handleSync = async (event: FormEvent) => {
    event.preventDefault();
    const balance = Number(availableBalance);

    if (provider.trim().length < 3) {
      toast({
        variant: "destructive",
        title: "Provider inválido",
        description: "Informe um provider com ao menos 3 caracteres.",
      });
      return;
    }

    if (Number.isNaN(balance) || balance < 0) {
      toast({
        variant: "destructive",
        title: "Saldo inválido",
        description: "Informe um saldo maior ou igual a zero.",
      });
      return;
    }

    await syncMutation.mutateAsync({
      provider: provider.trim(),
      availableBalance: balance,
    });
  };

  if (balanceQuery.isLoading || payablesQuery.isLoading) {
    return (
      <div className="p-4">
        <StatusBlock title="Carregando financeiro" isLoading />
      </div>
    );
  }

  if (balanceQuery.isError || payablesQuery.isError) {
    const error = toAppError(balanceQuery.error || payablesQuery.error);
    return (
      <div className="p-4">
        <StatusBlock
          title="Falha ao carregar financeiro"
          description={getFriendlyErrorMessage(error)}
          onRetry={() => {
            balanceQuery.refetch();
            payablesQuery.refetch();
          }}
        />
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4 pb-24">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Saldo Financeiro</CardTitle>
        </CardHeader>
        <CardContent className="space-y-1">
          <p className="text-2xl font-bold">{formatCurrency(balanceQuery.data.totalAvailable)}</p>
          <p className="text-sm text-muted-foreground">Carteira: {formatCurrency(balanceQuery.data.walletBalance)}</p>
          <p className="text-sm text-muted-foreground">Open Banking: {formatCurrency(balanceQuery.data.openBankingBalance)}</p>
        </CardContent>
      </Card>

      {role === "ADMIN" ? (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Sincronizar Open Banking</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="space-y-3" onSubmit={handleSync}>
              <div className="space-y-1">
                <Label htmlFor="provider">Provider</Label>
                <Input
                  id="provider"
                  value={provider}
                  onChange={(e) => setProvider(e.target.value)}
                  placeholder="Nome do provider"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="availableBalance">Saldo disponível</Label>
                <Input
                  id="availableBalance"
                  type="number"
                  value={availableBalance}
                  onChange={(e) => setAvailableBalance(e.target.value)}
                  placeholder="0.00"
                />
              </div>
              <Button className="w-full" type="submit" disabled={syncMutation.isPending}>
                {syncMutation.isPending ? "Sincronizando..." : "Sincronizar"}
              </Button>
            </form>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-4 text-sm text-muted-foreground">
            Você está com perfil DRIVER. A sincronização Open Banking é exclusiva para ADMIN.
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Contas a Pagar</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {pendingPayables.length ? (
            pendingPayables.map((payable) => (
              <div key={payable.id} className="border rounded-md p-3 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-medium">{payable.description}</p>
                  <Badge variant="secondary">{payable.status}</Badge>
                </div>
                <p className="text-sm text-muted-foreground">Vencimento: {formatDate(payable.dueDate)}</p>
                <p className="font-semibold">{formatCurrency(payable.amount)}</p>
                <Button
                  size="sm"
                  disabled={payMutation.isPending}
                  onClick={() => payMutation.mutate(payable.id)}
                >
                  Pagar conta
                </Button>
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">Nenhuma conta pendente.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Financeiro;
