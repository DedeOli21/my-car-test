import { useState } from "react";
import {
  Eye,
  EyeOff,
  ScanBarcode,
  DollarSign,
  ArrowUpRight,
  CheckCircle,
  CheckCircle2,
  Truck,
  Fuel,
  FileText,
  Keyboard,
  QrCode,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
  DrawerClose,
} from "@/components/ui/drawer";

const mockBoletos = [
  { id: 1, nome: "Manutenção Preventiva", vencimento: "03/03/2026", valor: 1850, urgente: true },
  { id: 2, nome: "Seguro do Veículo", vencimento: "08/03/2026", valor: 3200, urgente: false },
  { id: 3, nome: "Financiamento Caminhão", vencimento: "15/03/2026", valor: 4500, urgente: false },
];

const mockMovimentacoes = [
  { id: 1, tipo: "entrada" as const, descricao: "Pagamento Frete Raízen", valor: 4500, data: "01/03/2026", icone: "truck" },
  { id: 2, tipo: "saida" as const, descricao: "Abastecimento Posto Shell", valor: 1200, data: "28/02/2026", icone: "fuel" },
  { id: 3, tipo: "entrada" as const, descricao: "Pagamento Frete Meiwa", valor: 3800, data: "27/02/2026", icone: "truck" },
  { id: 4, tipo: "saida" as const, descricao: "Pagamento Boleto Seguro", valor: 3200, data: "25/02/2026", icone: "file" },
];

const iconMap: Record<string, React.ElementType> = {
  truck: Truck,
  fuel: Fuel,
  file: FileText,
};

const Financeiro = () => {
  const [showSaldo, setShowSaldo] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [boletosPagos, setBoletosPagos] = useState<number[]>([]);

  const togglePago = (id: number) => {
    setBoletosPagos((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const formatCurrency = (value: number) =>
    value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  return (
    <div className="p-4 space-y-6 animate-fade-in">
      {/* Header Bancário */}
      <div className="card-highlight bg-secondary border-primary/30 glow-primary">
        <div className="flex items-center justify-between mb-1">
          <span className="text-sm text-muted-foreground">Saldo Disponível</span>
          <button
            onClick={() => setShowSaldo(!showSaldo)}
            className="text-muted-foreground hover:text-foreground transition-colors p-1"
          >
            {showSaldo ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
          </button>
        </div>

        <p className="text-3xl font-bold text-foreground mb-3">
          {showSaldo ? "R$ 18.540,00" : "R$ ••••••"}
        </p>

        <div className="flex items-center gap-1.5 mb-5">
          <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
          <span className="text-xs text-emerald-400">Sincronizado via Open Banking</span>
        </div>

        {/* Ações Rápidas */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { icon: ScanBarcode, label: "Pagar Boleto", action: () => setDrawerOpen(true) },
            { icon: DollarSign, label: "Receber Frete", action: () => {} },
            { icon: ArrowUpRight, label: "Transferir", action: () => {} },
          ].map((item) => (
            <button
              key={item.label}
              onClick={item.action}
              className="flex flex-col items-center gap-1.5 group"
            >
              <div className="w-12 h-12 rounded-full bg-primary/15 border border-primary/30 flex items-center justify-center group-hover:bg-primary/25 transition-colors">
                <item.icon className="w-5 h-5 text-primary" />
              </div>
              <span className="text-[11px] text-muted-foreground group-hover:text-foreground transition-colors">
                {item.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Contas a Pagar */}
      <section>
        <div className="flex items-center gap-2 mb-3">
          <h2 className="text-lg font-semibold text-foreground">Contas a Pagar</h2>
          <Badge variant="secondary" className="text-xs">
            {mockBoletos.length - boletosPagos.length} pendentes
          </Badge>
        </div>

        <div className="space-y-2">
          {mockBoletos.map((boleto) => {
            const pago = boletosPagos.includes(boleto.id);
            return (
              <div
                key={boleto.id}
                className={`card-highlight flex items-center justify-between transition-opacity ${pago ? "opacity-50" : ""}`}
              >
                <div className="flex-1 min-w-0">
                  <p className={`font-medium text-foreground text-sm ${pago ? "line-through" : ""}`}>
                    {boleto.nome}
                  </p>
                  <p className={`text-xs mt-0.5 ${boleto.urgente && !pago ? "text-destructive font-semibold" : "text-muted-foreground"}`}>
                    Vence em {boleto.vencimento}
                  </p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className={`font-bold text-sm ${pago ? "text-emerald-400" : "text-foreground"}`}>
                    {formatCurrency(boleto.valor)}
                  </span>
                  <button onClick={() => togglePago(boleto.id)} className="transition-colors">
                    <CheckCircle2
                      className={`w-6 h-6 ${pago ? "text-emerald-400 fill-emerald-400/20" : "text-muted-foreground hover:text-primary"}`}
                    />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Últimas Movimentações */}
      <section>
        <h2 className="text-lg font-semibold text-foreground mb-3">Últimas Movimentações</h2>
        <div className="space-y-2">
          {mockMovimentacoes.map((mov) => {
            const Icon = iconMap[mov.icone] || FileText;
            const isEntrada = mov.tipo === "entrada";
            return (
              <div key={mov.id} className="card-highlight flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${isEntrada ? "bg-emerald-500/15" : "bg-destructive/15"}`}>
                  <Icon className={`w-5 h-5 ${isEntrada ? "text-emerald-400" : "text-destructive"}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{mov.descricao}</p>
                  <p className="text-xs text-muted-foreground">{mov.data}</p>
                </div>
                <span className={`font-bold text-sm shrink-0 ${isEntrada ? "text-emerald-400" : "text-destructive"}`}>
                  {isEntrada ? "+" : "-"} {formatCurrency(mov.valor)}
                </span>
              </div>
            );
          })}
        </div>
      </section>

      {/* Drawer Pagar Boleto */}
      <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
        <DrawerContent>
          <DrawerHeader className="text-center">
            <DrawerTitle>Pagar Boleto</DrawerTitle>
            <DrawerDescription>Escaneie ou digite o código de barras</DrawerDescription>
          </DrawerHeader>

          <div className="flex flex-col items-center px-6 py-8 gap-6">
            {/* Scanner area */}
            <div className="relative w-48 h-48 rounded-2xl border-2 border-dashed border-primary/40 flex items-center justify-center animate-pulse">
              <ScanBarcode className="w-16 h-16 text-primary/60" />
              <div className="absolute inset-x-4 top-1/2 h-0.5 bg-primary/50 rounded-full animate-bounce" />
            </div>
            <p className="text-sm text-muted-foreground text-center">
              Aponte a câmera para o código de barras
            </p>

            {/* Alt actions */}
            <div className="flex gap-3 w-full">
              <Button
                variant="outline"
                className="flex-1 rounded-full h-11 gap-2"
                onClick={() => console.log("Digitar código")}
              >
                <Keyboard className="w-4 h-4" />
                Digitar código
              </Button>
              <Button
                variant="outline"
                className="flex-1 rounded-full h-11 gap-2"
                onClick={() => console.log("Pagar via Pix")}
              >
                <QrCode className="w-4 h-4" />
                Pagar via Pix
              </Button>
            </div>
          </div>

          <DrawerFooter>
            <DrawerClose asChild>
              <Button variant="ghost" className="w-full">Cancelar</Button>
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </div>
  );
};

export default Financeiro;
