import { useState } from "react";
import {
  MapPin,
  Navigation,
  Truck,
  Package,
  Fuel,
  Clock,
  Route,
  Play,
  CheckCircle2,
  History,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface FreteDisponivel {
  id: number;
  origem: string;
  destino: string;
  distanciaKm: number;
  tipoCarga: string;
  combustivelLitros: number;
  enderecoColeta: string;
  enderecoDestino: string;
  eta: string;
}

interface FreteHistorico {
  id: number;
  origem: string;
  destino: string;
  data: string;
  km: number;
}

const mockFretesDisponiveis: FreteDisponivel[] = [
  {
    id: 1,
    origem: "Ribeirão Preto, SP",
    destino: "Santos, SP",
    distanciaKm: 430,
    tipoCarga: "Granel - Açúcar",
    combustivelLitros: 180,
    enderecoColeta: "Usina São Martinho, Rod. SP-322, Km 164",
    enderecoDestino: "Terminal Portuário, Av. Portuária, 1200 - Santos",
    eta: "17:30",
  },
  {
    id: 2,
    origem: "Campinas, SP",
    destino: "Belo Horizonte, MG",
    distanciaKm: 590,
    tipoCarga: "Carga Seca - Embalagens",
    combustivelLitros: 245,
    enderecoColeta: "CD Ambev, Rod. Dom Pedro I, Km 82",
    enderecoDestino: "Depósito Central, R. dos Tupis, 450 - BH",
    eta: "22:00",
  },
  {
    id: 3,
    origem: "Uberaba, MG",
    destino: "Goiânia, GO",
    distanciaKm: 480,
    tipoCarga: "Granel - Fertilizante",
    combustivelLitros: 200,
    enderecoColeta: "Mosaic Fertilizantes, BR-050, Km 12",
    enderecoDestino: "Cooperativa Agro, Rod. GO-060, Km 8 - Goiânia",
    eta: "19:45",
  },
];

const mockHistorico: FreteHistorico[] = [
  { id: 101, origem: "São Paulo, SP", destino: "Curitiba, PR", data: "18/03/2026", km: 410 },
  { id: 102, origem: "Campinas, SP", destino: "Rio de Janeiro, RJ", data: "14/03/2026", km: 480 },
  { id: 103, origem: "Uberlândia, MG", destino: "Ribeirão Preto, SP", data: "10/03/2026", km: 320 },
  { id: 104, origem: "Santos, SP", destino: "Campinas, SP", data: "06/03/2026", km: 160 },
];

type EtapaViagem = "aceito" | "deslocando" | "na_coleta" | "em_transito" | "concluido";

const DriverFretes = () => {
  const [activeFreight, setActiveFreight] = useState<FreteDisponivel | null>(null);
  const [etapa, setEtapa] = useState<EtapaViagem>("aceito");

  const handleAceitar = (frete: FreteDisponivel) => {
    setActiveFreight(frete);
    setEtapa("aceito");
  };

  const handleProximaEtapa = () => {
    const fluxo: EtapaViagem[] = ["aceito", "deslocando", "na_coleta", "em_transito", "concluido"];
    const idx = fluxo.indexOf(etapa);
    if (idx < fluxo.length - 1) {
      const proxima = fluxo[idx + 1];
      setEtapa(proxima);
      if (proxima === "concluido") {
        setActiveFreight(null);
        setEtapa("aceito");
      }
    }
  };

  const etapaLabel: Record<EtapaViagem, string> = {
    aceito: "Iniciar Deslocamento",
    deslocando: "Cheguei na Coleta",
    na_coleta: "Iniciar Transporte",
    em_transito: "Concluir Entrega",
    concluido: "",
  };

  const etapaBadge: Record<EtapaViagem, string> = {
    aceito: "Frete Aceito",
    deslocando: "Deslocando para Coleta",
    na_coleta: "No Local de Coleta",
    em_transito: "Em Trânsito",
    concluido: "Concluído",
  };

  return (
    <div className="p-4 space-y-4 pb-24 animate-fade-in">
      {/* Estado: Com Viagem Ativa */}
      {activeFreight ? (
        <Card className="card-highlight">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <Truck className="w-5 h-5 text-primary" />
                Viagem em Andamento
              </CardTitle>
              <Badge className="bg-[hsl(var(--info))] text-[hsl(var(--info-foreground))]">
                {etapaBadge[etapa]}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Rota */}
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="w-4 h-4 text-[hsl(var(--success))] shrink-0" />
              <span className="text-muted-foreground">{activeFreight.origem}</span>
              <Navigation className="w-4 h-4 text-primary shrink-0" />
              <span className="font-medium text-foreground">{activeFreight.destino}</span>
            </div>

            {/* Detalhes */}
            <div className="grid grid-cols-1 gap-3">
              <div className="rounded-lg bg-secondary p-3 space-y-2">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Endereços</p>
                <div className="space-y-1 text-sm">
                  <p>
                    <span className="text-muted-foreground">Coleta:</span>{" "}
                    <span className="text-foreground">{activeFreight.enderecoColeta}</span>
                  </p>
                  <p>
                    <span className="text-muted-foreground">Destino:</span>{" "}
                    <span className="text-foreground">{activeFreight.enderecoDestino}</span>
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="rounded-lg bg-secondary p-3 text-center">
                  <Package className="w-4 h-4 mx-auto text-primary mb-1" />
                  <p className="text-[10px] text-muted-foreground">Carga</p>
                  <p className="text-xs font-semibold text-foreground">{activeFreight.tipoCarga}</p>
                </div>
                <div className="rounded-lg bg-secondary p-3 text-center">
                  <Route className="w-4 h-4 mx-auto text-primary mb-1" />
                  <p className="text-[10px] text-muted-foreground">Distância</p>
                  <p className="text-xs font-semibold text-foreground">{activeFreight.distanciaKm} km</p>
                </div>
                <div className="rounded-lg bg-secondary p-3 text-center">
                  <Clock className="w-4 h-4 mx-auto text-primary mb-1" />
                  <p className="text-[10px] text-muted-foreground">ETA</p>
                  <p className="text-xs font-semibold text-foreground">{activeFreight.eta}</p>
                </div>
              </div>

              <div className="rounded-lg bg-secondary p-3 flex items-center gap-3">
                <Fuel className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-[10px] text-muted-foreground">Combustível Planejado</p>
                  <p className="text-sm font-semibold text-foreground">{activeFreight.combustivelLitros} litros</p>
                </div>
              </div>
            </div>

            {/* Botão de ação */}
            <Button className="w-full gap-2" onClick={handleProximaEtapa}>
              {etapa === "em_transito" ? (
                <CheckCircle2 className="w-4 h-4" />
              ) : (
                <Play className="w-4 h-4" />
              )}
              {etapaLabel[etapa]}
            </Button>
          </CardContent>
        </Card>
      ) : (
        /* Estado: Sem Viagem Ativa */
        <>
          <div className="space-y-1">
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
              <Truck className="w-5 h-5 text-primary" />
              Fretes Disponíveis
            </h2>
            <p className="text-sm text-muted-foreground">
              Selecione um frete para iniciar sua viagem.
            </p>
          </div>

          <div className="space-y-3">
            {mockFretesDisponiveis.map((frete) => (
              <Card key={frete.id} className="hover:border-primary/50 transition-colors">
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="w-4 h-4 text-[hsl(var(--success))] shrink-0" />
                    <span className="text-muted-foreground">{frete.origem}</span>
                    <Navigation className="w-4 h-4 text-primary shrink-0" />
                    <span className="font-medium text-foreground">{frete.destino}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Route className="w-3 h-3" />
                        {frete.distanciaKm} km
                      </span>
                      <span className="flex items-center gap-1">
                        <Package className="w-3 h-3" />
                        {frete.tipoCarga}
                      </span>
                    </div>
                    <Button size="sm" onClick={() => handleAceitar(frete)}>
                      Aceitar Frete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}

      {/* Histórico de Fretes Concluídos */}
      <Accordion type="single" collapsible>
        <AccordionItem value="historico" className="border rounded-lg bg-card">
          <AccordionTrigger className="px-4 hover:no-underline">
            <span className="flex items-center gap-2 text-base font-semibold">
              <History className="w-5 h-5 text-primary" />
              Histórico de Fretes Concluídos
              <Badge variant="secondary" className="ml-1 text-[10px]">
                {mockHistorico.length}
              </Badge>
            </span>
          </AccordionTrigger>
          <AccordionContent className="px-4 pb-4">
            <div className="space-y-2">
              {mockHistorico.map((item) => (
                <div
                  key={item.id}
                  className="rounded-lg bg-secondary p-3 text-sm flex items-center justify-between"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <Truck className="w-4 h-4 text-muted-foreground shrink-0" />
                    <span className="text-foreground truncate">
                      {item.origem} ➔ {item.destino}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-muted-foreground text-xs shrink-0 ml-2">
                    <span>{item.data}</span>
                    <span>{item.km} km</span>
                  </div>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
};

export default DriverFretes;
