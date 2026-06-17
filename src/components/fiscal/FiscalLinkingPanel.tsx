import { useMemo, useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { fiscalOptionLabel, fiscalStatusOptions } from "@/lib/fiscal-options";
import type { CTe, FiscalLink, MDFe, NFe, VincularDocumentosFiscaisPayload } from "@/types/fiscal";
import type { Freight } from "@/types/fleet";

interface FiscalLinkingPanelProps {
  freights: Freight[];
  ctes: CTe[];
  nfes: NFe[];
  mdfes: MDFe[];
  links: FiscalLink[];
  isSubmitting: boolean;
  onSubmit: (payload: VincularDocumentosFiscaisPayload) => Promise<void>;
}

const FiscalLinkingPanel = ({
  freights,
  ctes,
  nfes,
  mdfes,
  links,
  isSubmitting,
  onSubmit,
}: FiscalLinkingPanelProps) => {
  const [freteId, setFreteId] = useState(freights[0]?.id || "");

  const currentLink = links.find((link) => link.freteId === freteId);
  const [cteId, setCteId] = useState(currentLink?.cteId || "NONE");
  const [mdfeId, setMdfeId] = useState(currentLink?.mdfeId || "NONE");
  const [nfeIds, setNfeIds] = useState<string[]>(currentLink?.nfeIds || []);

  const selectedFreight = freights.find((freight) => freight.id === freteId);

  const availableCtes = useMemo(
    () => ctes.filter((cte) => cte.freteId === freteId || !cte.freteId),
    [ctes, freteId]
  );
  const availableMdfes = useMemo(
    () => mdfes.filter((mdfe) => mdfe.freteId === freteId || !mdfe.freteId),
    [mdfes, freteId]
  );
  const availableNfes = useMemo(
    () => nfes.filter((nfe) => nfe.freteId === freteId || !nfe.freteId || nfeIds.includes(nfe.id)),
    [nfes, freteId, nfeIds]
  );

  const handleFreightChange = (nextFreteId: string) => {
    const nextLink = links.find((link) => link.freteId === nextFreteId);
    setFreteId(nextFreteId);
    setCteId(nextLink?.cteId || "NONE");
    setMdfeId(nextLink?.mdfeId || "NONE");
    setNfeIds(nextLink?.nfeIds || []);
  };

  const toggleNFe = (nfeId: string) => {
    setNfeIds((current) =>
      current.includes(nfeId)
        ? current.filter((id) => id !== nfeId)
        : [...current, nfeId]
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Vínculo Fiscal por Frete</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 lg:grid-cols-3">
          <div className="space-y-1.5 lg:col-span-3">
            <Label>Frete</Label>
            <Select value={freteId} onValueChange={handleFreightChange}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o frete" />
              </SelectTrigger>
              <SelectContent>
                {freights.map((freight) => (
                  <SelectItem key={freight.id} value={freight.id}>
                    {freight.code} - {freight.origin} / {freight.destination}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label>CT-e</Label>
            <Select value={cteId} onValueChange={setCteId}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o CT-e" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="NONE">Sem CT-e</SelectItem>
                {availableCtes.map((cte) => (
                  <SelectItem key={cte.id} value={cte.id}>
                    {cte.numero} - {fiscalOptionLabel(fiscalStatusOptions, cte.status)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label>MDF-e</Label>
            <Select value={mdfeId} onValueChange={setMdfeId}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o MDF-e" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="NONE">Sem MDF-e</SelectItem>
                {availableMdfes.map((mdfe) => (
                  <SelectItem key={mdfe.id} value={mdfe.id}>
                    {mdfe.numero} - {fiscalOptionLabel(fiscalStatusOptions, mdfe.status)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-md border p-3 text-sm text-muted-foreground">
            {selectedFreight ? (
              <>
                <p className="font-medium text-foreground">{selectedFreight.code}</p>
                <p>{selectedFreight.origin} / {selectedFreight.destination}</p>
                <p>Valor bruto: {selectedFreight.totalValue.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</p>
              </>
            ) : (
              "Selecione um frete para vincular documentos."
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label>NF-es vinculadas</Label>
          <div className="grid gap-2 md:grid-cols-2">
            {availableNfes.length ? (
              availableNfes.map((nfe) => (
                <label key={nfe.id} className="flex items-start gap-3 rounded-md border p-3 text-sm">
                  <Checkbox checked={nfeIds.includes(nfe.id)} onCheckedChange={() => toggleNFe(nfe.id)} />
                  <span>
                    <span className="block font-medium">NF-e {nfe.numero}</span>
                    <span className="block text-muted-foreground">
                      {nfe.chaveAcesso} - {fiscalOptionLabel(fiscalStatusOptions, nfe.status)}
                    </span>
                  </span>
                </label>
              ))
            ) : (
              <p className="rounded-md border border-dashed p-4 text-sm text-muted-foreground">
                Nenhuma NF-e disponível para vínculo.
              </p>
            )}
          </div>
        </div>

        <div className="flex justify-end">
          <Button
            type="button"
            disabled={!freteId || isSubmitting}
            onClick={() =>
              onSubmit({
                freteId,
                cteId: cteId === "NONE" ? null : cteId,
                mdfeId: mdfeId === "NONE" ? null : mdfeId,
                nfeIds,
              })
            }
          >
            {isSubmitting ? "Salvando vínculo..." : "Salvar vínculo fiscal"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default FiscalLinkingPanel;
