import {
  Area,
  Bar,
  CartesianGrid,
  ComposedChart,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatBRL } from "@/lib/financeiro-format";
import type { FluxoCaixaItem } from "@/types/financeiro";

interface CashFlowChartProps {
  data: FluxoCaixaItem[];
}

const shortDate = (value: string) => {
  const [, month, day] = value.split("-");
  return `${day}/${month}`;
};

const CashFlowChart = ({ data }: CashFlowChartProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Fluxo de Caixa - Próximos 30 dias</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[360px]">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="data" tickFormatter={shortDate} stroke="hsl(var(--muted-foreground))" />
              <YAxis tickFormatter={(value) => formatBRL(Number(value)).replace("R$", "")} stroke="hsl(var(--muted-foreground))" />
              <Tooltip
                formatter={(value) => formatBRL(Number(value))}
                labelFormatter={(value) => `Data: ${shortDate(String(value))}`}
                contentStyle={{
                  background: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: 8,
                }}
              />
              <Legend />
              <Bar dataKey="entradas" name="Entradas" fill="hsl(145 60% 45%)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="saidas" name="Saídas" fill="hsl(0 72% 50%)" radius={[4, 4, 0, 0]} />
              <Area
                type="monotone"
                dataKey="saldoProjetado"
                name="Saldo Projetado"
                stroke="hsl(var(--primary))"
                fill="hsl(var(--primary) / 0.16)"
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default CashFlowChart;
