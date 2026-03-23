import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Pencil, Eye, Truck, MapPin, Navigation } from "lucide-react";

interface Motorista {
  id: string;
  nome: string;
  veiculo: string;
  placa: string;
  status: "disponivel" | "em_rota";
  origem?: string;
  destino?: string;
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
  },
  {
    id: "2",
    nome: "Carlos Eduardo",
    veiculo: "Scania R450",
    placa: "DEF-5678",
    status: "disponivel",
  },
  {
    id: "3",
    nome: "Roberto Santos",
    veiculo: "Mercedes Actros 2651",
    placa: "GHI-9012",
    status: "em_rota",
    origem: "Belo Horizonte, MG",
    destino: "Salvador, BA",
  },
  {
    id: "4",
    nome: "Anderson Lima",
    veiculo: "DAF XF 530",
    placa: "JKL-3456",
    status: "disponivel",
  },
  {
    id: "5",
    nome: "Fernando Oliveira",
    veiculo: "Iveco S-Way 570",
    placa: "MNO-7890",
    status: "em_rota",
    origem: "Rio de Janeiro, RJ",
    destino: "Vitória, ES",
  },
];

const Motoristas = () => {
  const [busca, setBusca] = useState("");

  const filtrados = mockMotoristas.filter(
    (m) =>
      m.nome.toLowerCase().includes(busca.toLowerCase()) ||
      m.placa.toLowerCase().includes(busca.toLowerCase())
  );

  return (
    <div className="p-4 space-y-4">
      <div>
        <h1 className="text-xl font-bold text-foreground">Gestão de Motoristas</h1>
        <p className="text-sm text-muted-foreground">
          {mockMotoristas.length} motoristas cadastrados
        </p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por nome ou placa..."
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          className="pl-9"
        />
      </div>

      <div className="space-y-2">
        {filtrados.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-8">
            Nenhum motorista encontrado.
          </p>
        )}

        {filtrados.map((m) => (
          <div
            key={m.id}
            className="flex items-center gap-3 bg-card border border-border rounded-xl px-4 py-3"
          >
            {/* Dados principais */}
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-foreground truncate">{m.nome}</p>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Truck className="w-3 h-3 shrink-0" />
                <span className="truncate">
                  {m.veiculo} — {m.placa}
                </span>
              </div>
            </div>

            {/* Status e rota */}
            <div className="hidden xs:flex flex-col items-end gap-1 shrink-0 text-right max-w-[180px]">
              <Badge
                variant={m.status === "em_rota" ? "default" : "secondary"}
                className={
                  m.status === "em_rota"
                    ? "bg-blue-600/20 text-blue-400 border-blue-500/30"
                    : "bg-emerald-600/20 text-emerald-400 border-emerald-500/30"
                }
              >
                {m.status === "em_rota" ? "🔵 Em Rota" : "🟢 Disponível"}
              </Badge>
              <span className="text-[10px] text-muted-foreground truncate max-w-full">
                {m.status === "em_rota" ? (
                  <span className="inline-flex items-center gap-0.5">
                    <MapPin className="w-2.5 h-2.5 inline" />
                    {m.origem} <Navigation className="w-2.5 h-2.5 inline mx-0.5" /> {m.destino}
                  </span>
                ) : (
                  "Aguardando atribuição de frete"
                )}
              </span>
            </div>

            {/* Mobile: badge only */}
            <div className="flex xs:hidden shrink-0">
              <Badge
                variant={m.status === "em_rota" ? "default" : "secondary"}
                className={
                  m.status === "em_rota"
                    ? "bg-blue-600/20 text-blue-400 border-blue-500/30 text-[10px] px-1.5"
                    : "bg-emerald-600/20 text-emerald-400 border-emerald-500/30 text-[10px] px-1.5"
                }
              >
                {m.status === "em_rota" ? "🔵" : "🟢"}
              </Badge>
            </div>

            {/* Ações */}
            <div className="flex items-center gap-1 shrink-0">
              {m.status === "em_rota" && (
                <Button variant="ghost" size="icon" className="h-8 w-8" title="Ver Viagem">
                  <Eye className="w-4 h-4" />
                </Button>
              )}
              <Button variant="ghost" size="icon" className="h-8 w-8" title="Editar">
                <Pencil className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Motoristas;
