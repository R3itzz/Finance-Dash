/**
 * Tipos principais do sistema financeiro
 */

// Receitas
export interface Income {
  id: string;
  description: string;
  amount: number;
  date: string;
  category: IncomeCategory;
  recurring: boolean;
}

export type IncomeCategory =
  | 'salary'
  | 'freelance'
  | 'investment_return'
  | 'other';

// Despesas
export interface Expense {
  id: string;
  description: string;
  amount: number;
  date: string;
  category: ExpenseCategory;
  type: 'fixed' | 'variable';
}

export type ExpenseCategory =
  | 'housing'
  | 'food'
  | 'transport'
  | 'health'
  | 'education'
  | 'entertainment'
  | 'shopping'
  | 'utilities'
  | 'other';

// Investimentos
export interface Investment {
  id: string;
  ticker: string;
  name: string;
  type: InvestmentType;
  quantity: number;
  avgPrice: number;
  currentPrice: number;
  lastUpdated: string;
  dividendYield?: number;
}

export type InvestmentType = 'stock' | 'fii' | 'bond' | 'crypto' | 'other';

// Dados de mercado (B3)
export interface MarketData {
  ticker: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  dividendYield?: number;
  pvp?: number;
  lastDividend?: number;
  sector?: string;
}

// Oportunidades de investimento
export interface InvestmentOpportunity {
  ticker: string;
  name: string;
  type: InvestmentType;
  currentPrice: number;
  dividendYield: number;
  roi: number;
  trend30d: number;
  trend90d: number;
  score: number; // Score calculado (0-100)
  recommendation: 'strong_buy' | 'buy' | 'hold' | 'sell';
}

// Projecao financeira
export interface ProjectionData {
  years: number;
  initialAmount: number;
  monthlyContribution: number;
  annualReturn: number;
  projectedValue: number;
  totalContributed: number;
  totalInterest: number;
  monthlyData: MonthlyProjection[];
}

export interface MonthlyProjection {
  month: number;
  date: string;
  value: number;
  contributed: number;
  interest: number;
}

// Resumo do dashboard
export interface FinancialSummary {
  totalIncome: number;
  totalExpenses: number;
  totalInvested: number;
  balance: number;
  savingsRate: number;
  investmentReturn: number;
}

// Configuracoes do usuario
export interface UserSettings {
  monthlyIncome: number;
  monthlyExpenses: number;
  investmentGoal: number;
  riskProfile: 'conservative' | 'moderate' | 'aggressive';
  currency: 'BRL' | 'USD';
}
