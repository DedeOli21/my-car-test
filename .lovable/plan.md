
# Tela Financeiro - Gestao Truck Pro

## Visao Geral
Criar uma tela completa de gestao financeira com visual de banco digital moderno, mantendo o tema escuro industrial ja existente no app. A tela tera 3 secoes principais + um Drawer para pagamento de boletos.

## Estrutura

### 1. Header Bancario (Saldo e Acoes Rapidas)
- Card de destaque com fundo mais escuro (`bg-secondary`) e borda primaria com glow
- "Saldo Disponivel" com valor grande (R$ 18.540,00)
- Botao de olho (Eye/EyeOff) para ocultar/mostrar saldo usando `useState`
- Indicativo verde "Sincronizado via Open Banking" com icone CheckCircle
- 3 botoes circulares de acao rapida lado a lado:
  - "Pagar Boleto" (icone ScanBarcode) -- abre o Drawer
  - "Receber Frete" (icone DollarSign)
  - "Transferir" (icone ArrowUpRight)

### 2. Contas a Pagar (Boletos)
- Titulo "Contas a Pagar" com badge de quantidade
- Lista mockada com 3 boletos:
  - Manutencao Preventiva (vencimento proximo, valor em vermelho)
  - Seguro do Veiculo
  - Financiamento Caminhao
- Cada item mostra: nome, data de vencimento (vermelho se urgente), valor e botao "Marcar como Pago" (icone CheckCircle2)
- Ao marcar como pago, o item muda visual (riscado ou badge verde)

### 3. Extrato / Ultimas Movimentacoes
- Titulo "Ultimas Movimentacoes"
- Array mockado com entradas e saidas:
  - Entradas (verde, prefixo +): "Pagamento Frete Raizen", "Pagamento Frete Meiwa"
  - Saidas (vermelho, prefixo -): "Abastecimento Posto X", "Pagamento Boleto Seguro"
- Icones representativos: Truck para fretes, Fuel para abastecimento, FileText para boletos

### 4. Drawer "Pagar Boleto"
- Usar o componente Drawer do shadcn/ui (vaul)
- Conteudo:
  - Icone grande de ScanBarcode centralizado simulando area de escaneamento
  - Texto "Aponte a camera para o codigo de barras"
  - Animacao sutil (borda pulsante ou linha de scan)
  - Botao arredondado/achatado com menos destaque abaixo com duas opcoes:
    - "Digitar codigo manualmente"
    - "Pagar via Pix"
  - Botao "Cancelar" para fechar

## Detalhes Tecnicos

### Arquivo modificado
- `src/pages/Financeiro.tsx` -- reescrita completa

### Dados mockados
```typescript
const mockBoletos = [
  { id: 1, nome: "Manutencao Preventiva", vencimento: "03/03/2026", valor: 1850, urgente: true },
  { id: 2, nome: "Seguro do Veiculo", vencimento: "08/03/2026", valor: 3200, urgente: false },
  { id: 3, nome: "Financiamento Caminhao", vencimento: "15/03/2026", valor: 4500, urgente: false },
];

const mockMovimentacoes = [
  { id: 1, tipo: "entrada", descricao: "Pagamento Frete Raizen", valor: 4500, data: "01/03/2026", icone: "truck" },
  { id: 2, tipo: "saida", descricao: "Abastecimento Posto Shell", valor: 1200, data: "28/02/2026", icone: "fuel" },
  { id: 3, tipo: "entrada", descricao: "Pagamento Frete Meiwa", valor: 3800, data: "27/02/2026", icone: "truck" },
  { id: 4, tipo: "saida", descricao: "Pagamento Boleto Seguro", valor: 3200, data: "25/02/2026", icone: "file" },
];
```

### Componentes shadcn/ui utilizados
- Drawer (ja instalado via vaul)
- Button
- Badge (para status de boletos)

### Estado local
- `showSaldo: boolean` -- toggle visibilidade do saldo
- `drawerOpen: boolean` -- controle do Drawer de pagamento
- `boletosPagos: number[]` -- IDs dos boletos marcados como pagos

### Icones Lucide
- Eye, EyeOff, ScanBarcode, DollarSign, ArrowUpRight, CheckCircle2, Truck, Fuel, FileText, Keyboard, QrCode
