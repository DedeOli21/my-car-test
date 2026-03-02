import { useState } from "react";
import {
  Truck,
  Plus,
  CheckCircle2,
  Clock,
  TrendingUp,
  DollarSign,
  CircleDollarSign,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface Frete {
  id: string;
  valor: number;
  data: string;
  status: "Pago" | "Pendente";
}

const mockFretes: Record<string, Frete[]> = {
  raizen: [
    { id: "FR-1042", valor: 3200, data: "28/02/2026", status: "Pago" },
    { id: "FR-1038", valor: 2800, data: "20/02/2026", status: "Pago" },
    { id: "FR-1035", valor: 4500, data: "12/02/2026", status: "Pendente" },
  ],
  meiwa: [
    { id: "FR-1041", valor: 1900, data: "27/02/2026", status: "Pendente" },
    { id: "FR-1036", valor: 2400, data: "15/02/2026", status: "Pago" },
  ],
  tecno: [
    { id: "FR-1040", valor: 3600, data: "25/02/2026", status: "Pago" },
    { id: "FR-1037", valor: 2100, data: "18/02/2026", status: "Pendente" },
    { id: "FR-1033", valor: 1800, data: "05/02/2026", status: "Pago" },
  ],
};

const formatCurrency = (v: number) =>
  `R$ ${v.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`;

const FreteCard = ({ frete }: { frete: Frete }) => {
  const isPago = frete.status === "Pago";
  return (
    <div className="card-highlight">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-bold text-foreground">#{frete.id}</span>
        <span className="text-xs text-muted-foreground">{frete.data}</span>
      </div>
      <div className="flex items-end justify-between">
        <p className="text-2xl font-extrabold text-foreground">
          {formatCurrency(frete.valor)}
        </p>
        <Badge
          className={
            isPago
              ? "bg-success/15 text-success border-success/30 hover:bg-success/20"
              : "bg-warning/15 text-warning border-warning/30 hover:bg-warning/20"
          }
        >
          {isPago ? (
            <CheckCircle2 className="w-3 h-3 mr-1" />
          ) : (
            <Clock className="w-3 h-3 mr-1" />
          )}
          {frete.status}
        </Badge>
      </div>
    </div>
  );
};

const Fretes = () => {
  const [tab, setTab] = useState("raizen");

  return (
    <div className="p-4 space-y-5 pb-24">
      {/* Header */}
      <div className="pt-2">
        <h1 className="text-2xl font-bold text-foreground">Gestão de Fretes</h1>
        <p className="text-sm text-muted-foreground">Controle por cliente</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-2">
        <div className="card-highlight border-success/30 text-center animate-fade-in">
          <DollarSign className="w-5 h-5 text-success mx-auto mb-1" />
          <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wide">
            Recebido
          </p>
          <p className="text-base font-extrabold text-success mt-0.5">
            R$ 12.400
          </p>
        </div>
        <div className="card-highlight border-warning/30 text-center animate-fade-in" style={{ animationDelay: "80ms" }}>
          <Clock className="w-5 h-5 text-warning mx-auto mb-1" />
          <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wide">
            A Receber
          </p>
          <p className="text-base font-extrabold text-warning mt-0.5">
            R$ 4.500
          </p>
        </div>
        <div className="card-highlight border-info/30 text-center animate-fade-in" style={{ animationDelay: "160ms" }}>
          <TrendingUp className="w-5 h-5 text-info mx-auto mb-1" />
          <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wide">
            Lucro
          </p>
          <p className="text-base font-extrabold text-info mt-0.5">
            R$ 8.900
          </p>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={tab} onValueChange={setTab} className="animate-fade-in" style={{ animationDelay: "200ms" }}>
        <TabsList className="w-full bg-secondary border border-border h-12">
          <TabsTrigger
            value="raizen"
            className="flex-1 text-sm font-semibold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            Raízen
          </TabsTrigger>
          <TabsTrigger
            value="meiwa"
            className="flex-1 text-sm font-semibold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            Meiwa
          </TabsTrigger>
          <TabsTrigger
            value="tecno"
            className="flex-1 text-sm font-semibold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            Tecno 2000
          </TabsTrigger>
        </TabsList>

        {Object.entries(mockFretes).map(([key, fretes]) => (
          <TabsContent key={key} value={key} className="mt-4 space-y-3">
            {fretes.map((frete) => (
              <FreteCard key={frete.id} frete={frete} />
            ))}
            <p className="text-center text-xs text-muted-foreground pt-1">
              {fretes.length} frete{fretes.length !== 1 && "s"} ·{" "}
              {formatCurrency(fretes.reduce((s, f) => s + f.valor, 0))} total
            </p>
          </TabsContent>
        ))}
      </Tabs>

      {/* FAB */}
      <div className="fixed bottom-20 left-1/2 -translate-x-1/2 w-full max-w-[480px] px-4 z-40">
        <Button
          onClick={() => console.log("Novo Frete clicado")}
          className="w-full h-14 bg-primary text-primary-foreground hover:bg-primary/90 text-base font-bold gap-2 glow-primary rounded-xl"
        >
          <Plus className="w-5 h-5" />
          Novo Frete
        </Button>
      </div>
    </div>
  );
};

export default Fretes;
