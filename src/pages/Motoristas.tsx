import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  Pencil,
  Eye,
  Truck,
  MapPin,
  Navigation,
  Plus,
  User,
  CreditCard,
  Calendar,
  Home,
  FileText,
  Fuel,
  Clock,
  Route,
  Package,
} from "lucide-react";

type MotoristaStatus = "disponivel" | "em_rota" | "manutencao";

interface FreteAtivo {
  coleta: string;
  destino: string;
  tipoCarga: string;
  distanciaKm: number;
  eta: string;
  litrosPlanejados: number;
}

interface Motorista {
  id: string;
  nome: string;
  veiculo: string;
  placa: string;
  status: MotoristaStatus;
  origem?: string;
  destino?: string;
  cnh: string;
  categoriaCnh: string;
  dataContratacao: string;
  endereco: string;
  cpf: string;
  freteAtivo?: FreteAtivo;
}

const mockMotoristas: Motorista[] = [
  {
    id: "1",
    nome: "José Moacir",
    veiculo: "Volvo FH 540",
    placa: "ABC-1234",
    status: "em_rota",
    origem: "São Paulo, SP",
    destino: "Curitiba, PR",
    cnh: "04839201847",
    categoriaCnh: "E",
    dataContratacao: "2021-03-15",
    endereco: "Rua das Palmeiras, 120 — Campinas, SP",
    cpf: "123.456.789-00",
    freteAtivo: {
      coleta: "Rua Industrial, 500 — São Paulo, SP",
      destino: "Av. das Torres, 1200 — Curitiba, PR",
      tipoCarga: "Carga Seca — Eletrônicos",
      distanciaKm: 408,
      eta: "23/03/2026 às 18:00",
      litrosPlanejados: 180,
    },
  },
  {
    id: "2",
    nome: "Carlos Eduardo",
    veiculo: "Scania R450",
    placa: "DEF-5678",
    status: "disponivel",
    cnh: "09283746510",
    categoriaCnh: "D",
    dataContratacao: "2022-07-01",
    endereco: "Av. Brasil, 3200 — Ribeirão Preto, SP",
    cpf: "987.654.321-00",
  },
  {
    id: "3",
    nome: "Roberto Santos",
    veiculo: "Mercedes Actros 2651",
    placa: "GHI-9012",
    status: "em_rota",
    origem: "Belo Horizonte, MG",
    destino: "Salvador, BA",
    cnh: "11223344556",
    categoriaCnh: "E",
    dataContratacao: "2020-01-10",
    endereco: "Rua Minas Gerais, 88 — Belo Horizonte, MG",
    cpf: "111.222.333-44",
    freteAtivo: {
      coleta: "Rod. BR-381, KM 12 — Betim, MG",
      destino: "Porto de Salvador, BA",
      tipoCarga: "Carga Pesada — Aço",
      distanciaKm: 1372,
      eta: "25/03/2026 às 06:00",
      litrosPlanejados: 520,
    },
  },
  {
    id: "4",
    nome: "Anderson Lima",
    veiculo: "DAF XF 530",
    placa: "JKL-3456",
    status: "manutencao",
    cnh: "55667788990",
    categoriaCnh: "E",
    dataContratacao: "2023-11-20",
    endereco: "Rua Goiás, 450 — Goiânia, GO",
    cpf: "555.666.777-88",
  },
  {
    id: "5",
    nome: "Fernando Oliveira",
    veiculo: "Iveco S-Way 570",
    placa: "MNO-7890",
    status: "em_rota",
    origem: "Rio de Janeiro, RJ",
    destino: "Vitória, ES",
    cnh: "99887766554",
    categoriaCnh: "E",
    dataContratacao: "2019-05-08",
    endereco: "Av. Atlântica, 900 — Rio de Janeiro, RJ",
    cpf: "999.888.777-66",
    freteAtivo: {
      coleta: "Porto do Rio, Cais 4 — Rio de Janeiro, RJ",
      destino: "Av. Beira Mar, 200 — Vitória, ES",
      tipoCarga: "Refrigerada — Alimentos",
      distanciaKm: 521,
      eta: "24/03/2026 às 14:30",
      litrosPlanejados: 210,
    },
  },
];

const statusConfig: Record<MotoristaStatus, { label: string; emoji: string; classes: string }> = {
  disponivel: {
    label: "Disponível",
    emoji: "🟢",
    classes: "bg-emerald-600/20 text-emerald-400 border-emerald-500/30",
  },
  em_rota: {
    label: "Em Rota",
    emoji: "🔵",
    classes: "bg-blue-600/20 text-blue-400 border-blue-500/30",
  },
  manutencao: {
    label: "Manutenção",
    emoji: "🟠",
    classes: "bg-amber-600/20 text-amber-400 border-amber-500/30",
  },
};

const emptyMotorista: Motorista = {
  id: "",
  nome: "",
  veiculo: "",
  placa: "",
  status: "disponivel",
  cnh: "",
  categoriaCnh: "D",
  dataContratacao: "",
  endereco: "",
  cpf: "",
};

const Motoristas = () => {
  const [busca, setBusca] = useState("");
  const [motoristas, setMotoristas] = useState<Motorista[]>(mockMotoristas);

  // Dialog states
  const [detailOpen, setDetailOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [freteOpen, setFreteOpen] = useState(false);
  const [selected, setSelected] = useState<Motorista | null>(null);
  const [editForm, setEditForm] = useState<Motorista>(emptyMotorista);

  const filtrados = motoristas.filter(
    (m) =>
      m.nome.toLowerCase().includes(busca.toLowerCase()) ||
      m.placa.toLowerCase().includes(busca.toLowerCase())
  );

  const openDetail = (m: Motorista) => {
    setSelected(m);
    setDetailOpen(true);
  };

  const openEdit = (m: Motorista | null) => {
    setEditForm(m ? { ...m } : { ...emptyMotorista, id: crypto.randomUUID() });
    setEditOpen(true);
  };

  const openFrete = (m: Motorista) => {
    setSelected(m);
    setFreteOpen(true);
  };

  const handleSave = () => {
    setMotoristas((prev) => {
      const exists = prev.find((m) => m.id === editForm.id);
      if (exists) return prev.map((m) => (m.id === editForm.id ? editForm : m));
      return [...prev, editForm];
    });
    setEditOpen(false);
  };

  const cfg = (s: MotoristaStatus) => statusConfig[s];

  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-foreground">Gestão de Motoristas</h1>
        <p className="text-sm text-muted-foreground">
          {motoristas.length} motoristas cadastrados
        </p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por nome ou placa..."
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* List */}
      <div className="space-y-2">
        {filtrados.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-8">
            Nenhum motorista encontrado.
          </p>
        )}

        {filtrados.map((m) => {
          const st = cfg(m.status);
          return (
            <div
              key={m.id}
              onClick={() => openDetail(m)}
              className="flex items-center gap-3 bg-card border border-border rounded-xl px-4 py-3 cursor-pointer hover:bg-secondary/60 transition-colors"
            >
              {/* Left: name + vehicle */}
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-foreground truncate">{m.nome}</p>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Truck className="w-3 h-3 shrink-0" />
                  <span className="truncate">
                    {m.veiculo} — {m.placa}
                  </span>
                </div>
              </div>

              {/* Center: status + route (hidden on mobile) */}
              <div className="hidden sm:flex flex-col items-end gap-1 shrink-0 text-right max-w-[200px]">
                <Badge variant="secondary" className={st.classes}>
                  {st.emoji} {st.label}
                </Badge>
                <span className="text-[10px] text-muted-foreground truncate max-w-full">
                  {m.status === "em_rota" ? (
                    <span className="inline-flex items-center gap-0.5">
                      <MapPin className="w-2.5 h-2.5 inline" />
                      {m.origem}
                      <Navigation className="w-2.5 h-2.5 inline mx-0.5" />
                      {m.destino}
                    </span>
                  ) : m.status === "manutencao" ? (
                    "Veículo em manutenção"
                  ) : (
                    "Aguardando atribuição de frete"
                  )}
                </span>
              </div>

              {/* Mobile badge */}
              <div className="flex sm:hidden shrink-0">
                <Badge variant="secondary" className={`${st.classes} text-[10px] px-1.5`}>
                  {st.emoji}
                </Badge>
              </div>

              {/* Actions */}
              <div
                className="flex items-center gap-1 shrink-0"
                onClick={(e) => e.stopPropagation()}
              >
                {m.status === "em_rota" && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    title="Ver Viagem"
                    onClick={() => openFrete(m)}
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  title="Editar"
                  onClick={() => openEdit(m)}
                >
                  <Pencil className="w-4 h-4" />
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      {/* FAB */}
      <Button
        onClick={() => openEdit(null)}
        className="fixed bottom-20 right-4 max-w-[480px] h-14 w-14 rounded-full bg-primary text-primary-foreground shadow-lg hover:bg-primary/90 z-50"
        size="icon"
      >
        <Plus className="w-6 h-6" />
      </Button>

      {/* ── Dialog: Detalhes do Motorista ── */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="bg-card border-border max-w-md">
          <DialogHeader>
            <DialogTitle className="text-foreground">Detalhes do Motorista</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Informações cadastrais (somente leitura)
            </DialogDescription>
          </DialogHeader>
          {selected && (
            <div className="space-y-4">
              {/* Avatar placeholder */}
              <div className="flex items-center gap-3">
                <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center">
                  <User className="w-8 h-8 text-muted-foreground" />
                </div>
                <div>
                  <p className="font-bold text-lg text-foreground">{selected.nome}</p>
                  <Badge variant="secondary" className={cfg(selected.status).classes}>
                    {cfg(selected.status).emoji} {cfg(selected.status).label}
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <DetailItem icon={CreditCard} label="CPF" value={selected.cpf} />
                <DetailItem icon={FileText} label="CNH" value={`${selected.cnh} (${selected.categoriaCnh})`} />
                <DetailItem icon={Calendar} label="Contratação" value={new Date(selected.dataContratacao).toLocaleDateString("pt-BR")} />
                <DetailItem icon={Truck} label="Veículo" value={`${selected.veiculo} — ${selected.placa}`} />
                <div className="col-span-2">
                  <DetailItem icon={Home} label="Endereço" value={selected.endereco} />
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ── Dialog: Edição / Cadastro ── */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="bg-card border-border max-w-md max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-foreground">
              {editForm.nome ? "Editar Motorista" : "Novo Motorista"}
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Preencha os dados do motorista
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <FormField label="Nome Completo" value={editForm.nome} onChange={(v) => setEditForm({ ...editForm, nome: v })} />
            <FormField label="CPF / CNPJ" value={editForm.cpf} onChange={(v) => setEditForm({ ...editForm, cpf: v })} />
            <div className="grid grid-cols-2 gap-3">
              <FormField label="CNH" value={editForm.cnh} onChange={(v) => setEditForm({ ...editForm, cnh: v })} />
              <FormField label="Categoria" value={editForm.categoriaCnh} onChange={(v) => setEditForm({ ...editForm, categoriaCnh: v })} />
            </div>
            <FormField label="Veículo" value={editForm.veiculo} onChange={(v) => setEditForm({ ...editForm, veiculo: v })} />
            <FormField label="Placa" value={editForm.placa} onChange={(v) => setEditForm({ ...editForm, placa: v })} />
            <FormField label="Endereço" value={editForm.endereco} onChange={(v) => setEditForm({ ...editForm, endereco: v })} />

            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Status</Label>
              <Select
                value={editForm.status}
                onValueChange={(v) => setEditForm({ ...editForm, status: v as MotoristaStatus })}
              >
                <SelectTrigger className="bg-secondary border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="disponivel">🟢 Disponível</SelectItem>
                  <SelectItem value="em_rota">🔵 Em Rota</SelectItem>
                  <SelectItem value="manutencao">🟠 Manutenção</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-2 pt-2">
              <Button onClick={handleSave} className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90">
                Salvar Alterações
              </Button>
              <Button variant="secondary" onClick={() => setEditOpen(false)} className="flex-1">
                Cancelar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Dialog: Frete Atual ── */}
      <Dialog open={freteOpen} onOpenChange={setFreteOpen}>
        <DialogContent className="bg-card border-border max-w-md">
          <DialogHeader>
            <DialogTitle className="text-foreground">Frete Atual</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              {selected?.nome} — detalhes da viagem
            </DialogDescription>
          </DialogHeader>
          {selected?.freteAtivo ? (
            <div className="space-y-3 text-sm">
              <DetailItem icon={MapPin} label="Coleta" value={selected.freteAtivo.coleta} />
              <DetailItem icon={Navigation} label="Destino" value={selected.freteAtivo.destino} />
              <DetailItem icon={Package} label="Tipo de Carga" value={selected.freteAtivo.tipoCarga} />
              <div className="grid grid-cols-3 gap-2">
                <DetailItem icon={Route} label="Distância" value={`${selected.freteAtivo.distanciaKm} km`} />
                <DetailItem icon={Clock} label="ETA" value={selected.freteAtivo.eta} />
                <DetailItem icon={Fuel} label="Combustível" value={`${selected.freteAtivo.litrosPlanejados} L`} />
              </div>
            </div>
          ) : (
            <p className="text-muted-foreground text-sm py-4 text-center">
              Aguardando frete.
            </p>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

/* ── Reusable sub-components ── */

function DetailItem({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <div className="space-y-0.5">
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground flex items-center gap-1">
        <Icon className="w-3 h-3" /> {label}
      </p>
      <p className="text-foreground font-medium text-sm">{value}</p>
    </div>
  );
}

function FormField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="bg-secondary border-border"
      />
    </div>
  );
}

export default Motoristas;
