import { useState, useMemo } from "react";
import { Fuel, Droplets, Gauge, Search, Wrench, Plus, Receipt, Paperclip } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency } from "@/lib/format";
import { cn } from "@/lib/utils";

/* ── mock data ──────────────────────────────────── */

const veiculos = [
  { id: "v1", modelo: "Volvo FH 540", placa: "ABC-1234" },
  { id: "v2", modelo: "Scania R450", placa: "DEF-5678" },
  { id: "v3", modelo: "Mercedes Actros 2651", placa: "GHI-9012" },
  { id: "v4", modelo: "DAF XF 530", placa: "JKL-3456" },
  { id: "v5", modelo: "Iveco S-Way 570", placa: "MNO-7890" },
];

const motoristas = [
  { id: "m1", nome: "José Moacir" },
  { id: "m2", nome: "Carlos Eduardo" },
  { id: "m3", nome: "Roberto Santos" },
  { id: "m4", nome: "Anderson Lima" },
  { id: "m5", nome: "Fernando Oliveira" },
];

type HistItem = {
  id: number;
  tipo: "combustivel" | "variavel";
  data: string;
  motorista: string;
  placa: string;
  litros?: number;
  odometro?: number;
  categoria?: string;
  valor: number;
};

const mockHistorico: HistItem[] = [
  { id: 1, tipo: "combustivel", data: "22/03/2026", motorista: "José Moacir", placa: "ABC-1234", litros: 320, odometro: 184520, valor: 2240 },
  { id: 2, tipo: "variavel", data: "21/03/2026", motorista: "Roberto Santos", placa: "GHI-9012", categoria: "Pedágio", valor: 380 },
  { id: 3, tipo: "combustivel", data: "21/03/2026", motorista: "Roberto Santos", placa: "GHI-9012", litros: 280, odometro: 201340, valor: 1960 },
  { id: 4, tipo: "variavel", data: "20/03/2026", motorista: "Fernando Oliveira", placa: "MNO-7890", categoria: "Borracharia", valor: 250 },
  { id: 5, tipo: "combustivel", data: "20/03/2026", motorista: "Fernando Oliveira", placa: "MNO-7890", litros: 150, odometro: 97800, valor: 1050 },
  { id: 6, tipo: "combustivel", data: "18/03/2026", motorista: "Carlos Eduardo", placa: "DEF-5678", litros: 200, odometro: 132100, valor: 1400 },
  { id: 7, tipo: "variavel", data: "17/03/2026", motorista: "Anderson Lima", placa: "JKL-3456", categoria: "Manutenção Rápida", valor: 520 },
  { id: 8, tipo: "combustivel", data: "15/03/2026", motorista: "José Moacir", placa: "ABC-1234", litros: 310, odometro: 183200, valor: 2170 },
];

/* km driven estimates per fuel entry (delta odometer) */
const KM_RODADOS = 1320 + 2140 + 1200 + 1300 + 1320; // sum of deltas
const TOTAL_LITROS = 320 + 280 + 150 + 200 + 310;
const TOTAL_COMBUSTIVEL = 2240 + 1960 + 1050 + 1400 + 2170;
const TOTAL_VARIAVEIS = 380 + 250 + 520;
const TOTAL_GASTO = TOTAL_COMBUSTIVEL + TOTAL_VARIAVEIS;
const CONSUMO_MEDIO = (KM_RODADOS / TOTAL_LITROS).toFixed(1);

/* ── component ──────────────────────────────────── */

const AdminAbastecimento = () => {
  const { toast } = useToast();

  // filters
  const [periodo, setPeriodo] = useState("este_mes");
  const [filtroVeiculo, setFiltroVeiculo] = useState("todos");
  const [filtroMotorista, setFiltroMotorista] = useState("todos");
  const [filtroTipo, setFiltroTipo] = useState("todos");

  // modals
  const [showFuelModal, setShowFuelModal] = useState(false);
  const [showExpenseModal, setShowExpenseModal] = useState(false);

  // fuel form
  const [fuelDate, setFuelDate] = useState<Date>(new Date());
  const [fuelVeiculo, setFuelVeiculo] = useState("");
  const [fuelMotorista, setFuelMotorista] = useState("");
  const [fuelOdometro, setFuelOdometro] = useState("");
  const [fuelLitros, setFuelLitros] = useState("");
  const [fuelValor, setFuelValor] = useState("");

  // expense form
  const [expDate, setExpDate] = useState<Date>(new Date());
  const [expVeiculo, setExpVeiculo] = useState("");
  const [expMotorista, setExpMotorista] = useState("");
  const [expCategoria, setExpCategoria] = useState("");
  const [expDescricao, setExpDescricao] = useState("");
  const [expValor, setExpValor] = useState("");

  const filteredHistory = useMemo(() => {
    return mockHistorico.filter((h) => {
      if (filtroVeiculo !== "todos" && h.placa !== filtroVeiculo) return false;
      if (filtroMotorista !== "todos" && h.motorista !== filtroMotorista) return false;
      if (filtroTipo === "combustivel" && h.tipo !== "combustivel") return false;
      if (filtroTipo === "variavel" && h.tipo !== "variavel") return false;
      return true;
    });
  }, [filtroVeiculo, filtroMotorista, filtroTipo]);

  const resetFuelForm = () => {
    setFuelDate(new Date()); setFuelVeiculo(""); setFuelMotorista("");
    setFuelOdometro(""); setFuelLitros(""); setFuelValor("");
  };

  const resetExpForm = () => {
    setExpDate(new Date()); setExpVeiculo(""); setExpMotorista("");
    setExpCategoria(""); setExpDescricao(""); setExpValor("");
  };

  const handleFuelSubmit = () => {
    if (!fuelVeiculo || !fuelMotorista || !fuelLitros || !fuelValor) {
      toast({ variant: "destructive", title: "Preencha todos os campos obrigatórios." });
      return;
    }
    toast({ title: "Abastecimento registrado!", description: `${fuelLitros}L — ${formatCurrency(Number(fuelValor))}` });
    resetFuelForm();
    setShowFuelModal(false);
  };

  const handleExpSubmit = () => {
    if (!expVeiculo || !expMotorista || !expCategoria || !expValor) {
      toast({ variant: "destructive", title: "Preencha todos os campos obrigatórios." });
      return;
    }
    toast({ title: "Gasto registrado!", description: `${expCategoria} — ${formatCurrency(Number(expValor))}` });
    resetExpForm();
    setShowExpenseModal(false);
  };

  return (
    <div className="p-4 space-y-4 pb-24">
      {/* ── Header + action buttons ── */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-bold text-foreground shrink-0">Despesas Operacionais</h1>
        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant="secondary" onClick={() => setShowExpenseModal(true)}>
            <Plus className="w-4 h-4 mr-1" /> Gasto Variável
          </Button>
          <Button size="sm" onClick={() => setShowFuelModal(true)}>
            <Fuel className="w-4 h-4 mr-1" /> Abastecimento
          </Button>
        </div>
      </div>

      {/* ── Operational Summary ── */}
      <Card>
        <CardHeader className="pb-2 flex flex-row items-center justify-between">
          <CardTitle className="text-base">Resumo Operacional</CardTitle>
          <Select value={periodo} onValueChange={setPeriodo}>
            <SelectTrigger className="w-[130px] h-7 text-xs bg-secondary border-border">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="este_mes">Este Mês</SelectItem>
              <SelectItem value="semana">Semana Passada</SelectItem>
              <SelectItem value="trimestre">Trimestre</SelectItem>
            </SelectContent>
          </Select>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Total Gasto */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center shrink-0">
                <Receipt className="w-5 h-5 text-destructive" />
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Total Gasto</p>
                <p className="text-lg font-bold text-destructive">{formatCurrency(TOTAL_GASTO)}</p>
                <p className="text-[10px] text-muted-foreground">
                  Diesel {formatCurrency(TOTAL_COMBUSTIVEL)} · Outros {formatCurrency(TOTAL_VARIAVEIS)}
                </p>
              </div>
            </div>
            {/* Volume */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[hsl(var(--info))]/10 flex items-center justify-center shrink-0">
                <Droplets className="w-5 h-5 text-[hsl(var(--info))]" />
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Volume Abastecido</p>
                <p className="text-lg font-bold text-foreground">{TOTAL_LITROS.toLocaleString("pt-BR")} L</p>
              </div>
            </div>
            {/* Consumo Médio */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[hsl(var(--success))]/10 flex items-center justify-center shrink-0">
                <Gauge className="w-5 h-5 text-[hsl(var(--success))]" />
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Consumo Médio</p>
                <p className="text-lg font-bold text-[hsl(var(--success))]">{CONSUMO_MEDIO} Km/L</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── Filters ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <Select value={filtroVeiculo} onValueChange={setFiltroVeiculo}>
          <SelectTrigger className="h-9 text-xs bg-secondary border-border">
            <SelectValue placeholder="Veículo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos os Veículos</SelectItem>
            {veiculos.map((v) => (
              <SelectItem key={v.id} value={v.placa}>{v.modelo} ({v.placa})</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filtroMotorista} onValueChange={setFiltroMotorista}>
          <SelectTrigger className="h-9 text-xs bg-secondary border-border">
            <SelectValue placeholder="Motorista" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos os Motoristas</SelectItem>
            {motoristas.map((m) => (
              <SelectItem key={m.id} value={m.nome}>{m.nome}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filtroTipo} onValueChange={setFiltroTipo}>
          <SelectTrigger className="h-9 text-xs bg-secondary border-border">
            <SelectValue placeholder="Tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos os Gastos</SelectItem>
            <SelectItem value="combustivel">Combustível</SelectItem>
            <SelectItem value="variavel">Gastos Variáveis</SelectItem>
          </SelectContent>
        </Select>

        <Select value={periodo} onValueChange={setPeriodo}>
          <SelectTrigger className="h-9 text-xs bg-secondary border-border">
            <SelectValue placeholder="Período" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="este_mes">Este Mês</SelectItem>
            <SelectItem value="semana">Semana Passada</SelectItem>
            <SelectItem value="trimestre">Trimestre</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* ── Unified History ── */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Histórico de Despesas</CardTitle>
        </CardHeader>
        <CardContent className="space-y-1">
          {filteredHistory.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-6">Nenhum registro encontrado.</p>
          )}
          {filteredHistory.map((h) => (
            <div key={h.id} className="flex items-center justify-between py-2.5 border-b border-border last:border-0">
              <div className="flex items-center gap-3 min-w-0">
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
                  h.tipo === "combustivel" ? "bg-secondary" : "bg-muted"
                )}>
                  {h.tipo === "combustivel"
                    ? <Fuel className="w-4 h-4 text-muted-foreground" />
                    : <Wrench className="w-4 h-4 text-muted-foreground" />
                  }
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-foreground truncate">
                      {h.motorista} <span className="text-muted-foreground">({h.placa})</span>
                    </p>
                    {h.tipo === "variavel" && h.categoria && (
                      <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-border text-muted-foreground">
                        {h.categoria}
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {h.data}
                    {h.litros != null && ` · ${h.litros}L`}
                    {h.odometro != null && ` · ${h.odometro.toLocaleString("pt-BR")} km`}
                  </p>
                </div>
              </div>
              <p className="text-sm font-bold text-destructive shrink-0 ml-2">
                {formatCurrency(h.valor)}
              </p>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* ── Modal: Novo Abastecimento ── */}
      <Dialog open={showFuelModal} onOpenChange={setShowFuelModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Fuel className="w-5 h-5 text-primary" /> Registrar Abastecimento
            </DialogTitle>
            <DialogDescription>Preencha os dados do abastecimento.</DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            {/* Date */}
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Data</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal h-10">
                    <CalendarIcon className="w-4 h-4 mr-2" />
                    {format(fuelDate, "dd/MM/yyyy")}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar mode="single" selected={fuelDate} onSelect={(d) => d && setFuelDate(d)} initialFocus className="p-3 pointer-events-auto" />
                </PopoverContent>
              </Popover>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Veículo</Label>
                <Select value={fuelVeiculo} onValueChange={setFuelVeiculo}>
                  <SelectTrigger className="bg-secondary border-border h-10"><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>
                    {veiculos.map((v) => <SelectItem key={v.id} value={v.id}>{v.modelo} — {v.placa}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Motorista</Label>
                <Select value={fuelMotorista} onValueChange={setFuelMotorista}>
                  <SelectTrigger className="bg-secondary border-border h-10"><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>
                    {motoristas.map((m) => <SelectItem key={m.id} value={m.id}>{m.nome}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Odômetro (Km)</Label>
                <Input type="number" placeholder="0" value={fuelOdometro} onChange={(e) => setFuelOdometro(e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Litros</Label>
                <Input type="number" placeholder="0" value={fuelLitros} onChange={(e) => setFuelLitros(e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Valor (R$)</Label>
                <Input type="number" placeholder="0,00" value={fuelValor} onChange={(e) => setFuelValor(e.target.value)} />
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <DialogClose asChild>
              <Button variant="secondary">Cancelar</Button>
            </DialogClose>
            <Button onClick={handleFuelSubmit}>Salvar Abastecimento</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Modal: Gasto Variável ── */}
      <Dialog open={showExpenseModal} onOpenChange={setShowExpenseModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Wrench className="w-5 h-5 text-primary" /> Registrar Gasto Variável
            </DialogTitle>
            <DialogDescription>Pedágio, borracharia, manutenção rápida e outros.</DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Data</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal h-10">
                    <CalendarIcon className="w-4 h-4 mr-2" />
                    {format(expDate, "dd/MM/yyyy")}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar mode="single" selected={expDate} onSelect={(d) => d && setExpDate(d)} initialFocus className="p-3 pointer-events-auto" />
                </PopoverContent>
              </Popover>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Veículo</Label>
                <Select value={expVeiculo} onValueChange={setExpVeiculo}>
                  <SelectTrigger className="bg-secondary border-border h-10"><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>
                    {veiculos.map((v) => <SelectItem key={v.id} value={v.id}>{v.modelo} — {v.placa}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Motorista</Label>
                <Select value={expMotorista} onValueChange={setExpMotorista}>
                  <SelectTrigger className="bg-secondary border-border h-10"><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>
                    {motoristas.map((m) => <SelectItem key={m.id} value={m.id}>{m.nome}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Categoria</Label>
                <Select value={expCategoria} onValueChange={setExpCategoria}>
                  <SelectTrigger className="bg-secondary border-border h-10"><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="borracharia">Borracharia</SelectItem>
                    <SelectItem value="pedagio">Pedágio</SelectItem>
                    <SelectItem value="manutencao">Manutenção Rápida</SelectItem>
                    <SelectItem value="outros">Outros</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Valor (R$)</Label>
                <Input type="number" placeholder="0,00" value={expValor} onChange={(e) => setExpValor(e.target.value)} />
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Descrição</Label>
              <Textarea placeholder="Detalhes do gasto..." className="resize-none h-16" value={expDescricao} onChange={(e) => setExpDescricao(e.target.value)} />
            </div>

            <Button variant="outline" className="w-full justify-start text-muted-foreground" type="button">
              <Paperclip className="w-4 h-4 mr-2" /> Anexar comprovante
            </Button>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <DialogClose asChild>
              <Button variant="secondary">Cancelar</Button>
            </DialogClose>
            <Button onClick={handleExpSubmit}>Salvar Gasto</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminAbastecimento;
