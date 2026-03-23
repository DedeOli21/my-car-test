import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  DollarSign,
  Fuel,
  Truck,
  Users,
  TrendingUp,
  TrendingDown,
  FileText,
  ArrowRight,
  ChevronDown,
  Wrench,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatCurrency } from "@/lib/format";
import { useAuth } from "@/context/AuthContext";

const mockTransacoes = [
  { id: 1, tipo: "entrada", descricao: "Frete Raízen #FR-1042", valor: 4500, data: "22/03/2026", icone: "truck" },
  { id: 2, tipo: "saida", descricao: "Abastecimento Posto Shell", valor: 1200, data: "21/03/2026", icone: "fuel" },
  { id: 3, tipo: "entrada", descricao: "Frete Meiwa #FR-1039", valor: 3800, data: "20/03/2026", icone: "truck" },
  { id: 4, tipo: "saida", descricao: "Manutenção Preventiva", valor: 1850, data: "19/03/2026", icone: "wrench" },
  { id: 5, tipo: "entrada", descricao: "Frete Ambev #FR-1035", valor: 5200, data: "18/03/2026", icone: "truck" },
];

const iconeMap = {
  truck: Truck,
  fuel: Fuel,
  file: FileText,
  wrench: Wrench,
};

const FATURAMENTO = 13500;
const DESPESAS = 3050;
const SALDO = 18540;
const LUCRO = FATURAMENTO - DESPESAS;

const AdminDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [periodo, setPeriodo] = useState("este_mes");

  const firstName = user?.name?.split(" ")[0] || "Admin";

  return (
    <div className="p-4 space-y-4 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Olá, {firstName}</h1>
        <Badge className="bg-[hsl(var(--info))]/20 text-[hsl(var(--info))] border border-[hsl(var(--info))]/30 gap-1 cursor-pointer hover:bg-[hsl(var(--info))]/30 transition-colors">
          <Users className="w-3 h-3" />
          3 em rota
        </Badge>
      </div>

      {/* Period filter */}
      <div className="flex justify-end">
        <Select value={periodo} onValueChange={setPeriodo}>
          <SelectTrigger className="w-[150px] h-8 text-xs bg-secondary border-border">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="este_mes">Este Mês</SelectItem>
            <SelectItem value="ultimos_7">Últimos 7 dias</SelectItem>
            <SelectItem value="ultimos_30">Últimos 30 dias</SelectItem>
            <SelectItem value="trimestre">Este Trimestre</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Card Saldo Total */}
      <Card className="card-highlight">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-primary" />
            Saldo Total Disponível
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold text-primary">{formatCurrency(SALDO)}</p>
          <p className="text-[10px] text-muted-foreground mt-1">Referente a Março</p>
          <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
            <TrendingUp className="w-3 h-3 text-[hsl(var(--success))]" />
            +12% em relação ao mês anterior
          </p>
        </CardContent>
      </Card>

      {/* Revenue + Expenses + Profit */}
      <div className="grid grid-cols-2 gap-3">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Truck className="w-4 h-4 text-[hsl(var(--success))]" />
              <p className="text-xs text-muted-foreground">Faturamento (Fretes)</p>
            </div>
            <p className="text-xl font-bold text-[hsl(var(--success))]">{formatCurrency(FATURAMENTO)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Fuel className="w-4 h-4 text-destructive" />
              <p className="text-xs text-muted-foreground">Despesas (Abast.)</p>
            </div>
            <p className="text-xl font-bold text-destructive">{formatCurrency(DESPESAS)}</p>
          </CardContent>
        </Card>
      </div>

      {/* Profit indicator */}
      <Card className="border-[hsl(var(--success))]/20">
        <CardContent className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[hsl(var(--success))]/10 flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-[hsl(var(--success))]" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Lucro Estimado</p>
              <p className="text-lg font-bold text-[hsl(var(--success))]">{formatCurrency(LUCRO)}</p>
            </div>
          </div>
          <Badge variant="secondary" className="bg-[hsl(var(--success))]/10 text-[hsl(var(--success))] border-[hsl(var(--success))]/20 text-xs">
            {((LUCRO / FATURAMENTO) * 100).toFixed(0)}% margem
          </Badge>
        </CardContent>
      </Card>

      {/* Últimas Transações */}
      <Card>
        <CardHeader className="pb-2 flex flex-row items-center justify-between">
          <CardTitle className="text-base">Últimas Transações</CardTitle>
          <Button
            variant="ghost"
            size="sm"
            className="text-xs text-primary gap-1 h-7 px-2"
            onClick={() => navigate("/financeiro")}
          >
            Ver extrato <ArrowRight className="w-3 h-3" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-3">
          {mockTransacoes.map((t) => {
            const Icone = iconeMap[t.icone as keyof typeof iconeMap] || FileText;
            const isEntrada = t.tipo === "entrada";
            return (
              <div key={t.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    isEntrada ? "bg-[hsl(var(--success))]/10" : "bg-destructive/10"
                  }`}>
                    <Icone className={`w-4 h-4 ${isEntrada ? "text-[hsl(var(--success))]" : "text-destructive"}`} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{t.descricao}</p>
                    <p className="text-xs text-muted-foreground">{t.data}</p>
                  </div>
                </div>
                <p className={`text-sm font-bold ${isEntrada ? "text-[hsl(var(--success))]" : "text-destructive"}`}>
                  {isEntrada ? "+" : "-"} {formatCurrency(t.valor)}
                </p>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard;
