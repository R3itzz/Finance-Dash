# Kash 💰

Dashboard de gerenciamento financeiro pessoal com análise de investimentos, projeções e visualização de dados.

![Version](https://img.shields.io/badge/version-1.0.0-green)
![License](https://img.shields.io/badge/license-MIT-blue)
![Stack](https://img.shields.io/badge/stack-React%20%2B%20Node.js%20%2B%20TypeScript-cyan)

## ✨ Funcionalidades

### Principal
- 📊 **Dashboard** - Visão geral com patrimônio total, receitas, despesas, assinaturas e metas
- 💰 **Lançamentos** - Registro de receitas e despesas categorizadas
- 📈 **Carteira** - Gestão de investimentos com atualização automática de preços
- 🔮 **Projeções** - Simulador de juros compostos com gráficos

### Configurações
- 🎯 **Meta Mensal** - Defina sua meta de economia mensal
- 📱 **Assinaturas** - Gerencie suas assinaturas recorrentes
- 🎯 **Metas** - Acompanhe metas financeiras (viagem, emergência, etc.)
- 👥 **Cadastros** - Gestão de usuários (admin)

### Estilo
- 🌙 **Modo Escuro/Claro** - Persiste automaticamente
- ✨ **Animações** - Transições suaves
- 🎨 **Design System** - Padrão visual consistente

## 🚀 Como executar

### Pré-requisitos
- Node.js 18+
- npm

### Instalação

```bash
# Instalar dependências
npm install

# Executar em modo desenvolvimento
npm run dev
```

### Acessar
Abra `http://localhost:5173` no navegador.

### Login (desenvolvimento)
- **Admin**: `nicolasreitz46@gmail.com` / sua senha

## 🏗️ Arquitetura

```
src/
├── components/       # Componentes React
│   ├── Sidebar.tsx      # Navegação lateral
│   ├── Dashboard.tsx    # Painel principal
│   ├── DataInput.tsx   # Lançamentos
│   ├── Investments.tsx  # Carteira
│   ├── Projections.tsx # Projeções
│   ├── Settings.tsx    # Configurações
│   └── Auth.tsx        # Login/Registro
├── hooks/           # Hooks React
│   ├── useFinanceData.ts    # Dados financeiros
│   ├── useSubscriptions.ts # Assinaturas
│   ├── useGoals.ts         # Metas
│   └── useUserSettings.ts # Configurações usuário
├── services/        # Integrações APIs
│   └── b3Api.ts     # Dados mercado
└── types/           # TypeScript types
```

## 🔌 Dados de Mercado

Os preços são atualizados automaticamente:
- Servidor busca dados da Yahoo Finance às 18:05 (segunda a sexta)
- Cache armazenado em `marketData.json`
- Atualização manual via endpoint `/api/market-data/refresh`

## 🔐 Segurança

- Rate limiting (prevenção brute-force)
- Helmet com CSP
- Sanitização de inputs
- Senhas hashing com bcrypt
- Token em environment variable

## 📄 Licença

MIT License - Livre para uso pessoal e comercial.

---

**Desenvolvido com** ❤️ por Nicolas Reitz