import { FormEvent, useState } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarIcon, Fuel, Droplets, Truck, Gauge, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency } from "@/lib/format";
import { cn } from "@/lib/utils";

const veiculos = [
  { id: "1", label: "Volvo FH 540 — José Moacir (ABC-1234)" },
  { id: "2", label: "Scania R450 — Carlos Eduardo (DEF-5678)" },
  { id: "3", label: "Mercedes Actros 2651 — Roberto Santos (GHI-9012)" },
  { id: "4", label: "DAF XF 530 — Anderson Lima (JKL-3456)" },
  { id: "5", label: "Iveco S-Way 570 — Fernando Oliveira (MNO-7890)" },
];

const mockHistorico = [
  { id: 1, data: "22/03/2026", motorista: "José Moacir", placa: "ABC-1234", litros: 320, odometro: 184520, valor: 2240 },
  { id: 2, data: "21/03/2026", motorista: "Roberto Santos", placa: "GHI-9012", litros: 280, odometro: 201340, valor: 1960 },
  { id: 3, data: "20/03/2026", motorista: "Fernando Oliveira", placa: "MNO-7890", litros: 150, odometro: 97800, valor: 1050 },
  { id: 4, data: "18/03/2026", motorista: "Carlos Eduardo", placa: "DEF-5678", litros: 200, odometro: 132100, valor: 1400 },
  { id: 5, data: "15/03/2026", motorista: "José Moacir", placa: "ABC-1234", litros: 310, odometro: 183200, valor: 2170 },
];

const TOTAL_GASTO = 8820;
const TOTAL_LITROS = 1260;

const AdminAbastecimento = () => {
  const { toast } = useToast();
  const [date, setDate] = useState<Date>(new Date());
  const [veiculo, setVeiculo] = useState("");
  const [odometro, setOdometro] = useState("");
  const [litros, setLitros] = useState("");
  const [valor, setValor] = useState("");
  const [periodo, setPeriodo] = useState("este_mes");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!veiculo || !odometro || !litros || !valor) {
      toast({ variant: "destructive", title: "Preencha todos os campos." });
      return;
    }
    toast({ title: "Abastecimento registrado!", description: `${litros}L — ${formatCurrency(Number(valor))}` });
    setVeiculo("");
    setOdometro("");
    setLitros("");
    setValor("");
  };

  return (
    <div className="p-4 space-y-4 pb-24">
      <h1 className="text-xl font-bold text-foreground">Abastecimento</h1>

      {/* Form */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Fuel className="w-4 h-4 text-primary" /> Registrar Abastecimento
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-3" onSubmit={handleSubmit}>
            <div className="grid grid-cols-2 gap-3">
              {/* Date */}
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Data</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal h-10",
                        !date && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="w-4 h-4 mr-2" />
                      {date ? format(date, "dd/MM/yyyy") : "Selecionar"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={(d) => d && setDate(d)}
                      initialFocus
                      className={cn("p-3 pointer-events-auto")}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Vehicle */}
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Veículo / Motorista</Label>
                <Select value={veiculo} onValueChange={setVeiculo}>
                  <SelectTrigger className="bg-secondary border-border h-10">
                    <SelectValue placeholder="Selecionar" />
                  </SelectTrigger>
                  <SelectContent>
                    {veiculos.map((v) => (
                      <SelectItem key={v.id} value={v.id}>{v.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Odômetro (Km)</Label>
                <Input type="number" placeholder="0" value={odometro} onChange={(e) => setOdometro(e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Litros</Label>
                <Input type="number" placeholder="0" value={litros} onChange={(e) => setLitros(e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Valor (R$)</Label>
                <Input type="number" placeholder="0,00" value={valor} onChange={(e) => setValor(e.target.value)} />
              </div>
            </div>

            <Button className="w-full" type="submit">Salvar abastecimento</Button>
          </form>
        </CardContent>
      </Card>

      {/* Summary */}
      <Card>
        <CardHeader className="pb-2 flex flex-row items-center justify-between">
          <CardTitle className="text-base">Resumo de Combustível</CardTitle>
          <Select value={periodo} onValueChange={setPeriodo}>
            <SelectTrigger className="w-[130px] h-7 text-xs bg-secondary border-border">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="este_mes">Este Mês</SelectItem>
              <SelectItem value="ultimos_7">Últimos 7 dias</SelectItem>
              <SelectItem value="trimestre">Trimestre</SelectItem>
            </SelectContent>
          </Select>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center shrink-0">
                <Fuel className="w-5 h-5 text-destructive" />
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Total Gasto</p>
                <p className="text-lg font-bold text-destructive">{formatCurrency(TOTAL_GASTO)}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[hsl(var(--info))]/10 flex items-center justify-center shrink-0">
                <Droplets className="w-5 h-5 text-[hsl(var(--info))]" />
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Volume Abastecido</p>
                <p className="text-lg font-bold text-foreground">{TOTAL_LITROS.toLocaleString("pt-BR")} L</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* History */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Últimos Abastecimentos</CardTitle>
        </CardHeader>
        <CardContent className="space-y-1">
          {mockHistorico.map((h) => (
            <div key={h.id} className="flex items-center justify-between py-2.5 border-b border-border last:border-0">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center shrink-0">
                  <Truck className="w-4 h-4 text-muted-foreground" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {h.motorista} <span className="text-muted-foreground">({h.placa})</span>
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {h.data} · {h.litros}L · {h.odometro.toLocaleString("pt-BR")} km
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
    </div>
  );
};

export default AdminAbastecimento;
