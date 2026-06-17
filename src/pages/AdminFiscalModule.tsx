import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { FilePlus2, ReceiptText } from "lucide-react";
import StatusBlock from "@/components/app/StatusBlock";
import CartaCorrecaoModal from "@/components/fiscal/CartaCorrecaoModal";
import CTeTable from "@/components/fiscal/CTeTable";
import FiscalLinkingPanel from "@/components/fiscal/FiscalLinkingPanel";
import NFeImportModal from "@/components/fiscal/NFeImportModal";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { getFriendlyErrorMessage } from "@/lib/error-messages";
import { toAppError } from "@/lib/errors";
import { fiscalOptionLabel, fiscalStatusOptions, nfeTypeOptions } from "@/lib/fiscal-options";
import { formatCurrency } from "@/lib/format";
import { queryKeys } from "@/lib/query-keys";
import { customerService } from "@/services/fleet/customer-service";
import { freightService } from "@/services/fleet/freight-service";
import { fiscalService } from "@/services/fiscal-service";
import type {
  CTe,
  FiscalDocumentFilters,
  ImportarNFePayload,
  VincularDocumentosFiscaisPayload,
} from "@/types/fiscal";

const emptyFilters: FiscalDocumentFilters = {
  status: "ALL",
  startDate: "",
  endDate: "",
  tomadorId: "ALL",
};

const formatDateTime = (value: string) =>
  new Date(value).toLocaleString("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  });

const AdminFiscalModule = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { user } = useAuth();
  const [filters, setFilters] = useState<FiscalDocumentFilters>(emptyFilters);
  const [selectedCteForCorrection, setSelectedCteForCorrection] = useState<CTe | null>(null);
  const [nfeImportOpen, setNfeImportOpen] = useState(false);

  const ctesQuery = useQuery({
    queryKey: [...queryKeys.ctes, filters],
    queryFn: () => fiscalService.getCTes(filters),
  });
  const nfesQuery = useQuery({
    queryKey: queryKeys.nfes,
    queryFn: fiscalService.getNFes,
  });
  const mdfesQuery = useQuery({
    queryKey: queryKeys.mdfes,
    queryFn: fiscalService.getMDFes,
  });
  const fiscalLinksQuery = useQuery({
    queryKey: queryKeys.fiscalLinks,
    queryFn: fiscalService.getFiscalLinks,
  });
  const freightsQuery = useQuery({
    queryKey: queryKeys.freights,
    queryFn: freightService.getFreights,
  });
  const customersQuery = useQuery({
    queryKey: queryKeys.customers,
    queryFn: customerService.getCustomers,
  });

  const ctes = useMemo(() => ctesQuery.data || [], [ctesQuery.data]);
  const nfes = useMemo(() => nfesQuery.data || [], [nfesQuery.data]);
  const mdfes = useMemo(() => mdfesQuery.data || [], [mdfesQuery.data]);
  const fiscalLinks = useMemo(() => fiscalLinksQuery.data || [], [fiscalLinksQuery.data]);
  const freights = useMemo(() => freightsQuery.data || [], [freightsQuery.data]);
  const customers = useMemo(() => customersQuery.data || [], [customersQuery.data]);

  const invalidateFiscal = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: queryKeys.ctes }),
      queryClient.invalidateQueries({ queryKey: queryKeys.nfes }),
      queryClient.invalidateQueries({ queryKey: queryKeys.mdfes }),
      queryClient.invalidateQueries({ queryKey: queryKeys.fiscalLinks }),
    ]);
  };

  const emitirCTeMutation = useMutation({
    mutationFn: () => {
      const freightWithoutCte = freights.find(
        (freight) => !ctes.some((cte) => cte.freteId === freight.id)
      );
      const freight = freightWithoutCte || freights[0];

      if (!freight) {
        throw new Error("Nenhum frete disponível para emissão.");
      }

      return fiscalService.emitirCTe({
        freteId: freight.id,
        tomadorId: freight.customerId,
        valorTotal: freight.totalValue,
      });
    },
    onSuccess: async (cte) => {
      await invalidateFiscal();
      toast({
        title: cte.status === "AUTORIZADO" ? "CT-e Autorizado com sucesso" : "Rejeição SEFAZ",
        description:
          cte.status === "AUTORIZADO"
            ? `CT-e ${cte.numero} emitido no ambiente mock.`
            : "O retorno mockado da SEFAZ rejeitou o documento.",
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Falha ao emitir CT-e",
        description: getFriendlyErrorMessage(toAppError(error)),
      });
    },
  });

  const cancelMutation = useMutation({
    mutationFn: (cte: CTe) =>
      fiscalService.cancelarCTe({
        cteId: cte.id,
        justificativa: "Cancelamento solicitado pelo painel Admin mockado.",
        updatedBy: user?.name || user?.email || "Admin",
      }),
    onSuccess: async (cte) => {
      await invalidateFiscal();
      toast({
        title: "CT-e cancelado",
        description: `Cancelamento do CT-e ${cte.numero} registrado com sucesso.`,
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Falha no cancelamento",
        description: getFriendlyErrorMessage(toAppError(error)),
      });
    },
  });

  const correctionMutation = useMutation({
    mutationFn: (correcao: string) => {
      if (!selectedCteForCorrection) {
        throw new Error("Nenhum CT-e selecionado.");
      }

      return fiscalService.emitirCartaCorrecao({
        cteId: selectedCteForCorrection.id,
        correcao,
        updatedBy: user?.name || user?.email || "Admin",
      });
    },
    onSuccess: async (cte) => {
      setSelectedCteForCorrection(null);
      await invalidateFiscal();
      toast({
        title: "CC-e emitida",
        description: `Carta de Correção vinculada ao CT-e ${cte.numero}.`,
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Falha ao emitir CC-e",
        description: getFriendlyErrorMessage(toAppError(error)),
      });
    },
  });

  const emailMutation = useMutation({
    mutationFn: (cte: CTe) =>
      fiscalService.enviarEmailTomador({
        cteId: cte.id,
        updatedBy: user?.name || user?.email || "Admin",
      }),
    onSuccess: async (cte) => {
      await invalidateFiscal();
      toast({
        title: "E-mail reenviado",
        description: `Documentos do CT-e ${cte.numero} reenviados ao tomador.`,
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Falha ao enviar e-mail",
        description: getFriendlyErrorMessage(toAppError(error)),
      });
    },
  });

  const importNFeMutation = useMutation({
    mutationFn: (payload: ImportarNFePayload) => fiscalService.importarNFe(payload),
    onSuccess: async (nfe) => {
      setNfeImportOpen(false);
      await invalidateFiscal();
      toast({
        title: "NF-e importada",
        description: `NF-e ${nfe.numero} autorizada no mock fiscal.`,
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Falha ao importar NF-e",
        description: getFriendlyErrorMessage(toAppError(error)),
      });
    },
  });

  const linkMutation = useMutation({
    mutationFn: (payload: VincularDocumentosFiscaisPayload) =>
      fiscalService.vincularDocumentosFiscais(payload),
    onSuccess: async () => {
      await invalidateFiscal();
      toast({
        title: "Vínculo fiscal atualizado",
        description: "Documentos fiscais vinculados ao frete selecionado.",
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Falha ao salvar vínculo",
        description: getFriendlyErrorMessage(toAppError(error)),
      });
    },
  });

  const isLoading =
    ctesQuery.isLoading ||
    nfesQuery.isLoading ||
    mdfesQuery.isLoading ||
    fiscalLinksQuery.isLoading ||
    freightsQuery.isLoading ||
    customersQuery.isLoading;

  const error =
    ctesQuery.error ||
    nfesQuery.error ||
    mdfesQuery.error ||
    fiscalLinksQuery.error ||
    freightsQuery.error ||
    customersQuery.error;

  const isFiscalBusy =
    emitirCTeMutation.isPending ||
    cancelMutation.isPending ||
    correctionMutation.isPending ||
    emailMutation.isPending ||
    importNFeMutation.isPending ||
    linkMutation.isPending;

  if (isLoading) {
    return (
      <div className="p-4">
        <StatusBlock title="Carregando módulo fiscal" isLoading />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <StatusBlock
          title="Falha ao carregar módulo fiscal"
          description={getFriendlyErrorMessage(toAppError(error))}
          onRetry={() => {
            ctesQuery.refetch();
            nfesQuery.refetch();
            mdfesQuery.refetch();
            fiscalLinksQuery.refetch();
            freightsQuery.refetch();
            customersQuery.refetch();
          }}
        />
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4 pb-24">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">Admin</p>
          <h1 className="text-2xl font-bold">Módulo Fiscal</h1>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            className="gap-2"
            onClick={() => setNfeImportOpen(true)}
          >
            <FilePlus2 className="h-4 w-4" />
            Importar NF-e
          </Button>
          <Button
            type="button"
            className="gap-2"
            disabled={emitirCTeMutation.isPending || !freights.length}
            onClick={() => emitirCTeMutation.mutate()}
          >
            <ReceiptText className="h-4 w-4" />
            {emitirCTeMutation.isPending ? "Emitindo..." : "Emitir CT-e Mock"}
          </Button>
        </div>
      </div>

      <Alert>
        <ReceiptText className="h-4 w-4" />
        <AlertTitle>Ambiente fiscal mockado</AlertTitle>
        <AlertDescription>
          Operações simulam latência da SEFAZ e retornos de autorização, rejeição, cancelamento, CC-e e envio de e-mail.
        </AlertDescription>
      </Alert>

      <Tabs defaultValue="ctes" className="space-y-4">
        <TabsList className="h-auto flex-wrap justify-start">
          <TabsTrigger value="ctes">CT-e</TabsTrigger>
          <TabsTrigger value="nfes">NF-e</TabsTrigger>
          <TabsTrigger value="links">Vínculos</TabsTrigger>
        </TabsList>

        <TabsContent value="ctes">
          <CTeTable
            ctes={ctes}
            customers={customers}
            freights={freights}
            filters={filters}
            isBusy={isFiscalBusy}
            onFiltersChange={setFilters}
            onOpenPdf={(cte) => window.open(cte.pdfUrl, "_blank")}
            onDownloadXml={(cte) => window.open(cte.xmlUrl, "_blank")}
            onCancel={(cte) => cancelMutation.mutate(cte)}
            onCorrection={setSelectedCteForCorrection}
            onResendEmail={(cte) => emailMutation.mutate(cte)}
          />
        </TabsContent>

        <TabsContent value="nfes">
          <Card>
            <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <CardTitle className="text-base">NF-es Importadas</CardTitle>
              <Button type="button" variant="outline" onClick={() => setNfeImportOpen(true)}>
                Importar NF-e
              </Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Número</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Frete</TableHead>
                    <TableHead>Emissão</TableHead>
                    <TableHead>Valor Produtos</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {nfes.length ? (
                    nfes.map((nfe) => (
                      <TableRow key={nfe.id}>
                        <TableCell>
                          <div>
                            <p className="font-semibold">{nfe.numero}</p>
                            <p className="text-xs text-muted-foreground">{nfe.chaveAcesso}</p>
                          </div>
                        </TableCell>
                        <TableCell>{fiscalOptionLabel(nfeTypeOptions, nfe.tipo)}</TableCell>
                        <TableCell>
                          <Badge variant="secondary">
                            {fiscalOptionLabel(fiscalStatusOptions, nfe.status)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {freights.find((freight) => freight.id === nfe.freteId)?.code || "-"}
                        </TableCell>
                        <TableCell>{formatDateTime(nfe.dataEmissao)}</TableCell>
                        <TableCell>{formatCurrency(nfe.valorProdutos)}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                        Nenhuma NF-e importada.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="links">
          <FiscalLinkingPanel
            freights={freights}
            ctes={ctes}
            nfes={nfes}
            mdfes={mdfes}
            links={fiscalLinks}
            isSubmitting={linkMutation.isPending}
            onSubmit={(payload) => linkMutation.mutateAsync(payload)}
          />
        </TabsContent>
      </Tabs>

      <CartaCorrecaoModal
        cte={selectedCteForCorrection}
        open={Boolean(selectedCteForCorrection)}
        isSubmitting={correctionMutation.isPending}
        onOpenChange={(open) => !open && setSelectedCteForCorrection(null)}
        onSubmit={(correcao) => correctionMutation.mutateAsync(correcao)}
      />

      <NFeImportModal
        open={nfeImportOpen}
        freights={freights}
        isSubmitting={importNFeMutation.isPending}
        onOpenChange={setNfeImportOpen}
        onSubmit={(payload) => importNFeMutation.mutateAsync(payload)}
      />
    </div>
  );
};

export default AdminFiscalModule;
