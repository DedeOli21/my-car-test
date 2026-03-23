import {
  DollarSign,
  Fuel,
  Truck,
  Users,
  TrendingUp,
  FileText,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/format";

const mockTransacoes = [
  { id: 1, tipo: "entrada", descricao: "Frete Raízen #FR-1042", valor: 4500, data: "22/03/2026", icone: "truck" },
  { id: 2, tipo: "saida", descricao: "Abastecimento Posto Shell", valor: 1200, data: "21/03/2026", icone: "fuel" },
  { id: 3, tipo: "entrada", descricao: "Frete Meiwa #FR-1039", valor: 3800, data: "20/03/2026", icone: "truck" },
  { id: 4, tipo: "saida", descricao: "Manutenção Preventiva", valor: 1850, data: "19/03/2026", icone: "file" },
];

const iconeMap = {
  truck: Truck,
  fuel: Fuel,
  file: FileText,
};

const AdminDashboard = () => {
  return (
    <div className="p-4 space-y-4 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">Olá,</p>
          <h1 className="text-2xl font-bold text-foreground">Administrador</h1>
        </div>
        <Badge className="bg-[hsl(var(--info))] text-[hsl(var(--info-foreground))] gap-1">
          <Users className="w-3 h-3" />
          3 em rota
        </Badge>
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
          <p className="text-3xl font-bold text-primary">{formatCurrency(18540)}</p>
          <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
            <TrendingUp className="w-3 h-3 text-[hsl(var(--success))]" />
            +12% em relação ao mês anterior
          </p>
        </CardContent>
      </Card>

      {/* Cards de Custos */}
      <div className="grid grid-cols-2 gap-3">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Truck className="w-4 h-4 text-primary" />
              <p className="text-xs text-muted-foreground">Custos Fretes</p>
            </div>
            <p className="text-xl font-bold text-foreground">{formatCurrency(12400)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Fuel className="w-4 h-4 text-primary" />
              <p className="text-xs text-muted-foreground">Abastecimento</p>
            </div>
            <p className="text-xl font-bold text-foreground">{formatCurrency(4500)}</p>
          </CardContent>
        </Card>
      </div>

      {/* Últimas Transações */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Últimas Transações</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {mockTransacoes.map((t) => {
            const Icone = iconeMap[t.icone as keyof typeof iconeMap] || FileText;
            const isEntrada = t.tipo === "entrada";
            return (
              <div key={t.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
                    <Icone className="w-4 h-4 text-muted-foreground" />
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
