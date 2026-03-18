import { FormEvent, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import StatusBlock from "@/components/app/StatusBlock";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { getFriendlyErrorMessage } from "@/lib/error-messages";
import { toAppError } from "@/lib/errors";
import { formatCurrency, formatDate } from "@/lib/format";
import { queryKeys } from "@/lib/query-keys";
import { transactionsService } from "@/services/transactions-service";

const Fretes = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");

  const transactionsQuery = useQuery({
    queryKey: queryKeys.transactions,
    queryFn: transactionsService.list,
  });

  const freightMutation = useMutation({
    mutationFn: transactionsService.createFreight,
    onSuccess: async () => {
      setAmount("");
      setDescription("");
      await queryClient.invalidateQueries({ queryKey: queryKeys.transactions });
      await queryClient.invalidateQueries({ queryKey: queryKeys.balance });
      toast({
        title: "Frete registrado",
        description: "Transação de frete criada com sucesso.",
      });
    },
    onError: (error) => {
      const parsed = toAppError(error);
      toast({
        variant: "destructive",
        title: "Não foi possível registrar",
        description: getFriendlyErrorMessage(parsed),
      });
    },
  });

  const freightTransactions = useMemo(() => {
    if (!transactionsQuery.data) {
      return [];
    }

    return transactionsQuery.data.filter((item) => item.type === "FREIGHT");
  }, [transactionsQuery.data]);

  const totalFreight = freightTransactions.reduce((sum, item) => sum + item.amount, 0);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    const parsedAmount = Number(amount);
    if (!parsedAmount || parsedAmount <= 0) {
      toast({
        variant: "destructive",
        title: "Valor inválido",
        description: "Informe um valor maior que zero.",
      });
      return;
    }

    if (description.trim().length < 3) {
      toast({
        variant: "destructive",
        title: "Descrição inválida",
        description: "A descrição precisa ter ao menos 3 caracteres.",
      });
      return;
    }

    await freightMutation.mutateAsync({
      amount: parsedAmount,
      description: description.trim(),
    });
  };

  return (
    <div className="p-4 space-y-4 pb-24">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Registrar Frete</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-3" onSubmit={handleSubmit}>
            <div className="space-y-1">
              <Label htmlFor="freight-amount">Valor</Label>
              <Input
                id="freight-amount"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="freight-description">Descrição</Label>
              <Input
                id="freight-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Ex.: Frete Raízen - São Paulo"
              />
            </div>
            <Button className="w-full" type="submit" disabled={freightMutation.isPending}>
              {freightMutation.isPending ? "Salvando..." : "Salvar frete"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Total recebido em fretes</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-semibold">{formatCurrency(totalFreight)}</p>
        </CardContent>
      </Card>

      {transactionsQuery.isLoading ? (
        <StatusBlock title="Carregando histórico" isLoading />
      ) : null}

      {transactionsQuery.isError ? (
        <StatusBlock
          title="Erro ao buscar histórico"
          description={getFriendlyErrorMessage(toAppError(transactionsQuery.error))}
          onRetry={() => transactionsQuery.refetch()}
        />
      ) : null}

      {!transactionsQuery.isLoading && !transactionsQuery.isError ? (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Últimos fretes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {freightTransactions.length ? (
              freightTransactions.map((item) => (
                <div key={item.id} className="border rounded-md p-3">
                  <p className="font-medium">{item.description}</p>
                  <p className="text-sm text-muted-foreground">{formatDate(item.createdAt)}</p>
                  <p className="font-semibold">{formatCurrency(item.amount)}</p>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">Nenhum frete registrado ainda.</p>
            )}
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
};

export default Fretes;
