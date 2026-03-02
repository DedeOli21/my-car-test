import { useState } from "react";
import {
  Fuel,
  DollarSign,
  Camera,
  Save,
  MapPin,
  Calendar,
  Gauge,
  Droplets,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const mockHistorico = [
  {
    id: 1,
    data: "28/02/2026",
    posto: "Posto Shell - BR 101",
    litros: 320,
    valor: 1920.0,
    tipo: "Diesel S10",
    km: 45230,
  },
  {
    id: 2,
    data: "22/02/2026",
    posto: "Posto Ipiranga - Rod. Castelo",
    litros: 280,
    valor: 1624.0,
    tipo: "Diesel S500",
    km: 44100,
  },
  {
    id: 3,
    data: "15/02/2026",
    posto: "Posto BR - Campinas",
    litros: 350,
    valor: 2100.0,
    tipo: "Diesel S10",
    km: 42800,
  },
];

const Abastecimento = () => {
  const [data, setData] = useState("");
  const [posto, setPosto] = useState("");
  const [km, setKm] = useState("");
  const [valor, setValor] = useState("");
  const [litros, setLitros] = useState("");
  const [tipo, setTipo] = useState("");

  return (
    <div className="p-4 space-y-5 pb-8">
      {/* Header */}
      <div className="pt-2">
        <h1 className="text-2xl font-bold text-foreground">Abastecimento</h1>
        <p className="text-sm text-muted-foreground">Controle de combustível</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-3">
        <div className="card-highlight border-warning/30 animate-fade-in">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-warning/15">
              <Gauge className="w-6 h-6 text-warning" strokeWidth={2.2} />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium">
                Média Consumo
              </p>
              <p className="text-xl font-bold text-foreground">2.8 km/l</p>
            </div>
          </div>
        </div>

        <div className="card-highlight border-destructive/30 animate-fade-in" style={{ animationDelay: "80ms" }}>
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-destructive/15">
              <DollarSign className="w-6 h-6 text-destructive" strokeWidth={2.2} />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium">
                Gasto no Mês
              </p>
              <p className="text-xl font-bold text-foreground">R$ 4.500</p>
            </div>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="card-highlight animate-fade-in" style={{ animationDelay: "150ms" }}>
        <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
          <Fuel className="w-5 h-5 text-primary" />
          Registrar Abastecimento
        </h2>

        <div className="space-y-4">
          {/* Data */}
          <div className="space-y-1.5">
            <Label htmlFor="data" className="text-sm text-muted-foreground flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" /> Data
            </Label>
            <Input
              id="data"
              type="date"
              value={data}
              onChange={(e) => setData(e.target.value)}
              className="h-12 bg-secondary border-border text-foreground text-base"
            />
          </div>

          {/* Posto */}
          <div className="space-y-1.5">
            <Label htmlFor="posto" className="text-sm text-muted-foreground flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5" /> Posto
            </Label>
            <Input
              id="posto"
              type="text"
              placeholder="Nome do posto"
              value={posto}
              onChange={(e) => setPosto(e.target.value)}
              className="h-12 bg-secondary border-border text-foreground text-base placeholder:text-muted-foreground"
            />
          </div>

          {/* Km e Litros */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="km" className="text-sm text-muted-foreground flex items-center gap-1.5">
                <Gauge className="w-3.5 h-3.5" /> Km Atual
              </Label>
              <Input
                id="km"
                type="number"
                placeholder="0"
                value={km}
                onChange={(e) => setKm(e.target.value)}
                className="h-12 bg-secondary border-border text-foreground text-base placeholder:text-muted-foreground"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="litros" className="text-sm text-muted-foreground flex items-center gap-1.5">
                <Droplets className="w-3.5 h-3.5" /> Litros
              </Label>
              <Input
                id="litros"
                type="number"
                placeholder="0"
                value={litros}
                onChange={(e) => setLitros(e.target.value)}
                className="h-12 bg-secondary border-border text-foreground text-base placeholder:text-muted-foreground"
              />
            </div>
          </div>

          {/* Valor Total */}
          <div className="space-y-1.5">
            <Label htmlFor="valor" className="text-sm text-muted-foreground flex items-center gap-1.5">
              <DollarSign className="w-3.5 h-3.5" /> Valor Total (R$)
            </Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-semibold text-base">
                R$
              </span>
              <Input
                id="valor"
                type="number"
                placeholder="0,00"
                value={valor}
                onChange={(e) => setValor(e.target.value)}
                className="h-12 bg-secondary border-border text-foreground text-base pl-10 placeholder:text-muted-foreground"
              />
            </div>
          </div>

          {/* Tipo de Combustível */}
          <div className="space-y-1.5">
            <Label className="text-sm text-muted-foreground flex items-center gap-1.5">
              <Fuel className="w-3.5 h-3.5" /> Tipo de Combustível
            </Label>
            <Select value={tipo} onValueChange={setTipo}>
              <SelectTrigger className="h-12 bg-secondary border-border text-foreground text-base">
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent className="bg-card border-border">
                <SelectItem value="diesel_s10">Diesel S10</SelectItem>
                <SelectItem value="diesel_s500">Diesel S500</SelectItem>
                <SelectItem value="arla_32">Arla 32</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Buttons */}
          <div className="flex flex-col gap-3 pt-2">
            <Button
              variant="outline"
              className="h-12 border-border text-muted-foreground hover:text-foreground hover:bg-secondary text-base gap-2"
            >
              <Camera className="w-5 h-5" />
              Anexar Foto da Nota (Opcional)
            </Button>
            <Button className="h-14 bg-primary text-primary-foreground hover:bg-primary/90 text-base font-bold gap-2 glow-primary">
              <Save className="w-5 h-5" />
              Salvar Abastecimento
            </Button>
          </div>
        </div>
      </div>

      {/* History */}
      <div className="animate-fade-in" style={{ animationDelay: "250ms" }}>
        <h2 className="text-lg font-bold text-foreground mb-3">Histórico Recente</h2>
        <div className="space-y-3">
          {mockHistorico.map((item) => (
            <div key={item.id} className="card-highlight flex items-center justify-between">
              <div className="flex items-center gap-3 min-w-0">
                <div className="p-2.5 rounded-xl bg-warning/15 shrink-0">
                  <Fuel className="w-5 h-5 text-warning" strokeWidth={2.2} />
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-foreground text-sm truncate">
                    {item.posto}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {item.data} · {item.litros}L · {item.tipo}
                  </p>
                </div>
              </div>
              <p className="font-bold text-foreground text-sm shrink-0 ml-2">
                R$ {item.valor.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Abastecimento;
