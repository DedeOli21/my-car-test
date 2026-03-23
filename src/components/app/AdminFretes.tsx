import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency } from "@/lib/format";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Plus,
  Truck,
  Clock,
  Navigation,
  DollarSign,
  CalendarIcon,
  MapPin,
  User,
  Package,
} from "lucide-react";

interface Freight {
  id: string;
  origin: string;
  destination: string;
  status: "waiting" | "in_progress" | "completed";
  driverName: string | null;
  vehicle: string | null;
  value: number;
  expectedDate: string;
  cargoType: string;
}

const mockFreights: Freight[] = [
  { id: "FR-1042", origin: "São Paulo, SP", destination: "Campinas, SP", status: "in_progress", driverName: "José Moacir", vehicle: "Volvo FH 540", value: 4500, expectedDate: "2026-03-25", cargoType: "Granel" },
  { id: "FR-1043", origin: "Santos, SP", destination: "Ribeirão Preto, SP", status: "waiting", driverName: null, vehicle: null, value: 6200, expectedDate: "2026-03-26", cargoType: "Seca" },
  { id: "FR-1044", origin: "Curitiba, PR", destination: "Florianópolis, SC", status: "in_progress", driverName: "Carlos Eduardo", vehicle: "Scania R450", value: 3800, expectedDate: "2026-03-24", cargoType: "Frigorificada" },
  { id: "FR-1045", origin: "Belo Horizonte, MG", destination: "Vitória, ES", status: "waiting", driverName: null, vehicle: null, value: 5100, expectedDate: "2026-03-27", cargoType: "Granel" },
  { id: "FR-1046", origin: "Goiânia, GO", destination: "Uberlândia, MG", status: "completed", driverName: "Marcos Oliveira", vehicle: "Mercedes Actros", value: 3200, expectedDate: "2026-03-20", cargoType: "Seca" },
  { id: "FR-1047", origin: "Rio de Janeiro, RJ", destination: "Juiz de Fora, MG", status: "completed", driverName: "Pedro Santos", vehicle: "DAF XF", value: 2900, expectedDate: "2026-03-18", cargoType: "Granel" },
  { id: "FR-1048", origin: "Londrina, PR", destination: "Maringá, PR", status: "waiting", driverName: null, vehicle: null, value: 1800, expectedDate: "2026-03-28", cargoType: "Seca" },
];

const mockDrivers = [
  { id: "d1", name: "José Moacir", vehicle: "Volvo FH 540" },
  { id: "d2", name: "Carlos Eduardo", vehicle: "Scania R450" },
  { id: "d3", name: "Marcos Oliveira", vehicle: "Mercedes Actros" },
  { id: "d4", name: "Pedro Santos", vehicle: "DAF XF" },
  { id: "d5", name: "André Lima", vehicle: "Iveco S-Way" },
];

const statusConfig = {
  waiting: { label: "Aguardando", color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30" },
  in_progress: { label: "Em Andamento", color: "bg-blue-500/20 text-blue-400 border-blue-500/30" },
  completed: { label: "Concluído", color: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" },
};

const AdminFretes = () => {
  const { toast } = useToast();
  const [modalOpen, setModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("all");

  // New freight form
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [expectedDate, setExpectedDate] = useState<Date>();
  const [cargoType, setCargoType] = useState("");
  const [freightValue, setFreightValue] = useState("");
  const [assignedDriver, setAssignedDriver] = useState("pool");

  const metrics = useMemo(() => {
    const waiting = mockFreights.filter((f) => f.status === "waiting").length;
    const inRoute = mockFreights.filter((f) => f.status === "in_progress").length;
    const revenue = mockFreights.reduce((sum, f) => sum + f.value, 0);
    return { waiting, inRoute, revenue };
  }, []);

  const filteredFreights = useMemo(() => {
    if (activeTab === "all") return mockFreights;
    if (activeTab === "available") return mockFreights.filter((f) => f.status === "waiting");
    if (activeTab === "active") return mockFreights.filter((f) => f.status === "in_progress");
    return mockFreights.filter((f) => f.status === "completed");
  }, [activeTab]);

  const resetForm = () => {
    setOrigin("");
    setDestination("");
    setExpectedDate(undefined);
    setCargoType("");
    setFreightValue("");
    setAssignedDriver("pool");
  };

  const handleSave = () => {
    if (!origin || !destination || !freightValue) {
      toast({ variant: "destructive", title: "Campos obrigatórios", description: "Preencha origem, destino e valor." });
      return;
    }
    toast({ title: "Frete criado", description: `Frete ${origin} ➔ ${destination} registrado com sucesso.` });
    resetForm();
    setModalOpen(false);
  };

  return (
    <div className="p-4 space-y-4 pb-24">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-bold text-foreground shrink-0">Centro de Despacho</h1>
        <Button onClick={() => setModalOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Novo Frete
        </Button>
      </div>

      {/* Metrics */}
      <Card className="border-primary/20">
        <CardContent className="pt-5 pb-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-yellow-500/10">
                <Clock className="h-5 w-5 text-yellow-400" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Aguardando Motorista</p>
                <p className="text-2xl font-bold text-foreground">{metrics.waiting}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-blue-500/10">
                <Navigation className="h-5 w-5 text-blue-400" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Em Rota</p>
                <p className="text-2xl font-bold text-foreground">{metrics.inRoute}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-emerald-500/10">
                <DollarSign className="h-5 w-5 text-emerald-400" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Faturamento Previsto</p>
                <p className="text-2xl font-bold text-foreground">{formatCurrency(metrics.revenue)}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full grid grid-cols-4 bg-secondary">
          <TabsTrigger value="all">Todos</TabsTrigger>
          <TabsTrigger value="available">Disponíveis</TabsTrigger>
          <TabsTrigger value="active">Em Andamento</TabsTrigger>
          <TabsTrigger value="completed">Concluídos</TabsTrigger>
        </TabsList>

        {["all", "available", "active", "completed"].map((tab) => (
          <TabsContent key={tab} value={tab} className="space-y-3 mt-3">
            {filteredFreights.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground text-sm">
                  Nenhum frete encontrado nesta categoria.
                </CardContent>
              </Card>
            ) : (
              filteredFreights.map((freight) => (
                <Card key={freight.id} className="hover:border-primary/30 transition-colors">
                  <CardContent className="p-4 space-y-3">
                    {/* Top row: ID + Status */}
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-muted-foreground">#{freight.id}</span>
                      <Badge variant="outline" className={cn("text-xs border", statusConfig[freight.status].color)}>
                        {statusConfig[freight.status].label}
                      </Badge>
                    </div>

                    {/* Route */}
                    <div className="flex items-center gap-2 text-foreground">
                      <MapPin className="h-4 w-4 text-primary shrink-0" />
                      <span className="font-medium text-sm">{freight.origin}</span>
                      <span className="text-muted-foreground">➔</span>
                      <span className="font-medium text-sm">{freight.destination}</span>
                    </div>

                    {/* Details row */}
                    <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <User className="h-3.5 w-3.5" />
                        {freight.driverName ? (
                          <span>{freight.driverName} · {freight.vehicle}</span>
                        ) : (
                          <span className="italic">Sem motorista</span>
                        )}
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-muted-foreground">
                          {new Date(freight.expectedDate).toLocaleDateString("pt-BR")}
                        </span>
                        <span className="text-base font-bold text-foreground">
                          {formatCurrency(freight.value)}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>
        ))}
      </Tabs>

      {/* Modal: New Freight */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Truck className="h-5 w-5 text-primary" />
              Novo Frete
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="nf-origin">Origem</Label>
                <Input id="nf-origin" placeholder="Ex: São Paulo, SP" value={origin} onChange={(e) => setOrigin(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="nf-dest">Destino</Label>
                <Input id="nf-dest" placeholder="Ex: Campinas, SP" value={destination} onChange={(e) => setDestination(e.target.value)} />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Data Prevista</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !expectedDate && "text-muted-foreground")}>
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {expectedDate ? format(expectedDate, "dd/MM/yyyy") : "Selecionar data"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar mode="single" selected={expectedDate} onSelect={setExpectedDate} locale={ptBR} className={cn("p-3 pointer-events-auto")} />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="space-y-1.5">
                <Label>Tipo de Carga</Label>
                <Select value={cargoType} onValueChange={setCargoType}>
                  <SelectTrigger><SelectValue placeholder="Selecionar" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="granel">Granel</SelectItem>
                    <SelectItem value="frigorificada">Frigorificada</SelectItem>
                    <SelectItem value="seca">Seca</SelectItem>
                    <SelectItem value="perigosa">Carga Perigosa</SelectItem>
                    <SelectItem value="container">Container</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="nf-value">Valor do Frete (R$)</Label>
                <Input id="nf-value" type="number" placeholder="0,00" value={freightValue} onChange={(e) => setFreightValue(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>Atribuir Motorista</Label>
                <Select value={assignedDriver} onValueChange={setAssignedDriver}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pool">Deixar Disponível no Pool</SelectItem>
                    {mockDrivers.map((d) => (
                      <SelectItem key={d.id} value={d.id}>{d.name} — {d.vehicle}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="secondary" onClick={() => { resetForm(); setModalOpen(false); }}>Cancelar</Button>
            <Button onClick={handleSave}>Salvar Frete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminFretes;
