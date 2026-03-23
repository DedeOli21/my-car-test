

# Dashboard com Renderização Condicional por Perfil (DRIVER / ADMIN)

## Visão Geral
Reescrever o Dashboard e o AppLayout para exibir conteúdo e navegação diferentes conforme o `role` do usuário (`DRIVER` ou `ADMIN`). Como o app usa dados mockados atualmente, vamos usar mock data local em vez das queries ao backend.

## Arquivos a Criar

### 1. `src/components/app/DriverDashboard.tsx`
Componente da visão do motorista — puramente operacional, sem dados financeiros.

- **Header**: "Olá, José Moacir" + Badge de status (🟢 Livre / 🔵 Em Viagem) controlado por `useState`
- **Card Principal Dinâmico**:
  - Estado "Em Viagem": Rota (Origem ➔ Destino), status do frete, 3 botões de ação (Registrar Abastecimento, Reportar Ocorrência, Concluir Viagem)
  - Estado "Livre": Mensagem "Sem viagens em andamento" + CTA "Ver Fretes Disponíveis"
- **Card Resumo Quinzenal**: Métricas mockadas — Distância percorrida (km), Viagens concluídas, Combustível registrado (litros)
- Dados 100% mockados com `useState`

### 2. `src/components/app/AdminDashboard.tsx`
Componente da visão do administrador — foco gerencial e financeiro.

- **Header**: "Olá, Administrador" + resumo de motoristas em rota (ex: "3 motoristas em rota")
- **Card destaque**: Saldo Total Disponível (R$ 18.540,00)
- **2 cards menores lado a lado**: Custos com Fretes (R$ 12.400,00) e Custos com Abastecimento (R$ 4.500,00)
- **Card Últimas Transações**: Lista mockada de movimentações recentes
- Dados 100% mockados

## Arquivos a Modificar

### 3. `src/pages/Dashboard.tsx`
Simplificar para apenas importar `useAuth`, ler o `role`, e renderizar `<DriverDashboard />` ou `<AdminDashboard />` condicionalmente. Remover as queries ao backend.

### 4. `src/components/AppLayout.tsx`
Tornar as tabs da bottom navigation dinâmicas com base no `role`:
- **DRIVER**: Início, Abastecimento, Fretes (3 abas — sem Financeiro)
- **ADMIN**: Início, Motoristas, Abastecimento, Fretes, Financeiro (5 abas — adiciona Motoristas com ícone `Users`)

## Detalhes Técnicos

- Ambos os dashboards usam `Card`, `CardContent`, `CardHeader`, `CardTitle`, `Badge`, `Button` do shadcn/ui
- Ícones Lucide: `MapPin`, `Navigation`, `Fuel`, `AlertTriangle`, `CheckCircle2`, `Truck`, `Users`, `DollarSign`, `TrendingUp`, `Route`
- Estado local para simular toggle "Em Viagem" / "Livre" no DriverDashboard
- `formatCurrency` de `@/lib/format` para valores monetários
- Tema dark existente mantido (`bg-background`, `bg-card`, `text-foreground`, `card-highlight`)

