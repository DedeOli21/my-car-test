import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  MapPin,
  Navigation,
  Fuel,
  AlertTriangle,
  CheckCircle2,
  Truck,
  Route,
  TrendingUp,
  Eye,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";

const DriverDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [emViagem, setEmViagem] = useState(false);

  const userName = user?.name || "José Moacir";

  const viagemAtual = {
    origem: "Ribeirão Preto, SP",
    destino: "Santos, SP",
    status: "Em trânsito",
    frete: "#FR-1042",
  };

  const resumoQuinzenal = {
    distanciaKm: 3420,
    viagensConcluidas: 8,
    combustivelLitros: 1285,
  };

  return (
    <div className="p-4 space-y-4 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">Olá,</p>
          <h1 className="text-2xl font-bold text-foreground">{userName}</h1>
        </div>
        <Badge
          className={
            emViagem
              ? "bg-[hsl(var(--info))] text-[hsl(var(--info-foreground))]"
              : "bg-[hsl(var(--success))] text-[hsl(var(--success-foreground))]"
          }
          onClick={() => setEmViagem(!emViagem)}
        >
          {emViagem ? "🔵 Em Viagem" : "🟢 Livre"}
        </Badge>
      </div>

      {/* Card Principal - Viagem Atual */}
      <Card className="card-highlight">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Truck className="w-5 h-5 text-primary" />
            Viagem Atual
          </CardTitle>
        </CardHeader>
        <CardContent>
          {emViagem ? (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="w-4 h-4 text-[hsl(var(--success))]" />
                <span className="text-muted-foreground">{viagemAtual.origem}</span>
                <Navigation className="w-4 h-4 text-primary" />
                <span className="text-foreground font-medium">{viagemAtual.destino}</span>
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Frete: {viagemAtual.frete}</span>
                <Badge variant="outline" className="text-primary border-primary">
                  {viagemAtual.status}
                </Badge>
              </div>

              <div className="grid grid-cols-3 gap-2 pt-2">
                <Button
                  size="sm"
                  variant="secondary"
                  className="flex flex-col h-auto py-3 gap-1"
                  onClick={() => navigate("/abastecimento")}
                >
                  <Fuel className="w-4 h-4" />
                  <span className="text-[10px]">Abastecer</span>
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  className="flex flex-col h-auto py-3 gap-1"
                  onClick={() => console.log("Reportar ocorrência")}
                >
                  <AlertTriangle className="w-4 h-4" />
                  <span className="text-[10px]">Ocorrência</span>
                </Button>
                <Button
                  size="sm"
                  className="flex flex-col h-auto py-3 gap-1"
                  onClick={() => setEmViagem(false)}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span className="text-[10px]">Concluir</span>
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center py-6 space-y-4">
              <Route className="w-12 h-12 text-muted-foreground mx-auto" />
              <p className="text-muted-foreground text-sm">
                Você não possui viagens em andamento.
              </p>
              <Button onClick={() => navigate("/fretes")} className="w-full">
                <Eye className="w-4 h-4 mr-2" />
                Ver Fretes Disponíveis
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Card Resumo Quinzenal */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            Resumo Quinzenal
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center p-3 rounded-lg bg-secondary">
              <p className="text-xl font-bold text-foreground">
                {resumoQuinzenal.distanciaKm.toLocaleString("pt-BR")}
              </p>
              <p className="text-[10px] text-muted-foreground mt-1">Km percorridos</p>
            </div>
            <div className="text-center p-3 rounded-lg bg-secondary">
              <p className="text-xl font-bold text-foreground">
                {resumoQuinzenal.viagensConcluidas}
              </p>
              <p className="text-[10px] text-muted-foreground mt-1">Viagens</p>
            </div>
            <div className="text-center p-3 rounded-lg bg-secondary">
              <p className="text-xl font-bold text-foreground">
                {resumoQuinzenal.combustivelLitros.toLocaleString("pt-BR")}
              </p>
              <p className="text-[10px] text-muted-foreground mt-1">Litros</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DriverDashboard;
