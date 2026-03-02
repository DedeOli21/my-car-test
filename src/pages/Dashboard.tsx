import {
  DollarSign,
  Truck,
  Fuel,
  Route,
  TrendingUp,
  ChevronRight,
  User,
} from "lucide-react";

const mockData = {
  userName: "Carlos Silva",
  saldoBancario: 12450.0,
  totalFretes: 8,
  gastoDiesel: 3820.5,
  kmRodado: 4560,
  lucroLiquido: 6230.75,
  ultimoFrete: {
    cliente: "Raízen",
    valor: 2800.0,
    data: "28/02/2026",
    status: "Pago",
  },
};

interface SummaryCardProps {
  icon: React.ElementType;
  label: string;
  value: string;
  variant?: "default" | "primary" | "success" | "warning" | "info";
  delay?: number;
}

const variantClasses: Record<string, string> = {
  default: "border-border",
  primary: "border-primary/30 glow-primary",
  success: "border-success/30",
  warning: "border-warning/30",
  info: "border-info/30",
};

const iconBgClasses: Record<string, string> = {
  default: "bg-muted text-foreground",
  primary: "bg-primary/15 text-primary",
  success: "bg-success/15 text-success",
  warning: "bg-warning/15 text-warning",
  info: "bg-info/15 text-info",
};

const SummaryCard = ({
  icon: Icon,
  label,
  value,
  variant = "default",
  delay = 0,
}: SummaryCardProps) => (
  <div
    className={`card-highlight ${variantClasses[variant]} animate-fade-in`}
    style={{ animationDelay: `${delay}ms` }}
  >
    <div className="flex items-center gap-3">
      <div className={`p-3 rounded-xl ${iconBgClasses[variant]}`}>
        <Icon className="w-6 h-6" strokeWidth={2.2} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-muted-foreground font-medium">{label}</p>
        <p className="text-xl font-bold text-foreground truncate">{value}</p>
      </div>
    </div>
  </div>
);

const Dashboard = () => {
  return (
    <div className="p-4 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between pt-2">
        <div>
          <p className="text-sm text-muted-foreground">Olá,</p>
          <h1 className="text-2xl font-bold text-foreground">
            {mockData.userName}
          </h1>
        </div>
        <div className="w-11 h-11 rounded-full bg-secondary flex items-center justify-center">
          <User className="w-5 h-5 text-muted-foreground" />
        </div>
      </div>

      {/* Saldo principal */}
      <div className="card-highlight border-primary/30 glow-primary animate-fade-in">
        <p className="text-sm text-muted-foreground font-medium mb-1">
          Saldo Bancário
        </p>
        <p className="text-3xl font-extrabold text-gradient-primary">
          R$ {mockData.saldoBancario.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
        </p>
      </div>

      {/* Cards de resumo */}
      <div className="grid grid-cols-2 gap-3">
        <SummaryCard
          icon={Truck}
          label="Total Fretes"
          value={`${mockData.totalFretes} fretes`}
          variant="info"
          delay={100}
        />
        <SummaryCard
          icon={Fuel}
          label="Gasto Diesel"
          value={`R$ ${mockData.gastoDiesel.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`}
          variant="warning"
          delay={150}
        />
        <SummaryCard
          icon={Route}
          label="Km Rodado"
          value={`${mockData.kmRodado.toLocaleString("pt-BR")} km`}
          variant="default"
          delay={200}
        />
        <SummaryCard
          icon={TrendingUp}
          label="Lucro Líquido"
          value={`R$ ${mockData.lucroLiquido.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`}
          variant="success"
          delay={250}
        />
      </div>

      {/* Último frete */}
      <div
        className="card-highlight animate-fade-in"
        style={{ animationDelay: "300ms" }}
      >
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-bold text-foreground">Último Frete</h2>
          <ChevronRight className="w-5 h-5 text-muted-foreground" />
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-primary/15">
              <DollarSign className="w-5 h-5 text-primary" strokeWidth={2.2} />
            </div>
            <div>
              <p className="font-semibold text-foreground">
                {mockData.ultimoFrete.cliente}
              </p>
              <p className="text-sm text-muted-foreground">
                {mockData.ultimoFrete.data}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="font-bold text-foreground">
              R${" "}
              {mockData.ultimoFrete.valor.toLocaleString("pt-BR", {
                minimumFractionDigits: 2,
              })}
            </p>
            <span className="inline-block text-xs font-semibold px-2 py-0.5 rounded-full bg-success/15 text-success">
              {mockData.ultimoFrete.status}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
