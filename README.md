# Finance Dashboard

Dashboard de gerenciamento financeiro pessoal com análise de investimentos B3, projeções e visualização de dados.

## ✨ Funcionalidades

- 📊 **Dashboard** - Visão geral de receitas, despesas e investimentos
- 💰 **Lançamentos** - Registro de receitas e despesas categorizadas
- 📈 **Carteira** - Gestão de investimentos com atualização de preços
- 💡 **Oportunidades** - Ranking de melhores investimentos baseado em análise
- 🔮 **Projeções** - Simulador de juros compostos com projeção de patrimônio

## 🚀 Como executar

### Pré-requisitos
- Node.js 18+
- npm ou yarn

### Instalação

```bash
# Instalar dependências
npm install

# Executar em modo desenvolvimento
npm run dev

# Build para produção
npm run build
```

### Acessar
Abra `http://localhost:5173` no navegador.

## 🏗️ Arquitetura

```
src/
├── components/       # Componentes React
│   ├── Sidebar.tsx      # Navegação lateral
│   ├── Dashboard.tsx    # Painel principal
│   ├── DataInput.tsx    # Formulários de entrada
│   ├── Investments.tsx  # Carteira de investimentos
│   ├── Opportunities.tsx # Oportunidades B3
│   └── Projections.tsx  # Simulador de projeções
├── hooks/           # Hooks customizados
│   ├── useLocalStorage.ts  # Persistência local
│   └── useFinanceData.ts   # Gerenciamento de dados
├── services/        # Integrações com APIs
│   └── b3Api.ts     # Dados da B3 (mockado)
├── utils/           # Utilitários
│   └── projections.ts    # Cálculos financeiros
└── types/           # TypeScript types
```

## 🔌 Integração B3

Atualmente os dados são **mockados** para demonstração. Para integrar com uma API real:

1. Obtenha uma API key de um serviço como:
   - [Alpha Vantage](https://www.alphavantage.co/)
   - [Yahoo Finance API](https://finance.yahoo.com/)
   - [Brapi](https://brapi.dev/) (API gratuita para B3)

2. Edite `src/services/b3Api.ts`:

```typescript
const API_KEY = 'sua_api_key';
const BASE_URL = 'https://api.brapi.dev/v1';

export async function getMarketData(ticker: string): Promise<MarketData> {
  const response = await fetch(
    `${BASE_URL}/quote/${ticker}?token=${API_KEY}`
  );
  const data = await response.json();

  return {
    ticker: data.results[0].symbol,
    price: data.results[0].regularMarketPrice,
    change: data.results[0].regularMarketChange,
    changePercent: data.results[0].regularMarketChangePercent,
    volume: data.results[0].regularMarketVolume,
    dividendYield: data.results[0].dividendYield,
  };
}
```

3. Atualize também `updateInvestmentPrices` e `getInvestmentOpportunities`.

## 🎨 Design System

- **Cores**: Paleta minimalista com verde primário
- **Tipografia**: Inter (sans-serif)
- **Sombras**: Suaves e sutis
- **Espaçamento**: Generoso whitespace
- **Dark mode**: Suporte nativo

## 📝 Roadmap

- [ ] Integração real com API B3
- [ ] Backend (Node.js/Firebase)
- [ ] Autenticação de usuários
- [ ] Exportação CSV completa
- [ ] Notificações de oportunidades
- [ ] App mobile (React Native)

## 📄 Licença

MIT - Livre para uso pessoal e comercial.
