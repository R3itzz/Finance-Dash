import { useMemo } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  PiggyBank,
  DollarSign,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import type { useFinanceData } from '../hooks/useFinanceData';
import { formatCurrency, formatPercent } from '../utils/projections';

interface DashboardProps {
  data: ReturnType<typeof useFinanceData>;
}

const COLORS = ['#22c55e', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

const EXPENSE_CATEGORIES: Record<string, string> = {
  housing: 'Moradia',
  food: 'Alimentação',
  transport: 'Transporte',
  health: 'Saúde',
  education: 'Educação',
  entertainment: 'Lazer',
  shopping: 'Compras',
  utilities: 'Contas',
  other: 'Outros',
};

export function Dashboard({ data }: DashboardProps) {
  const { summary, monthlyData, expensesByCategory, investmentsByType } = data;

  const pieData = useMemo(() => {
    return expensesByCategory.map(item => ({
      name: EXPENSE_CATEGORIES[item.category] || item.category,
      value: item.amount,
    }));
  }, [expensesByCategory]);

  const allocationData = useMemo(() => {
    return investmentsByType.map(item => ({
      name: item.type.toUpperCase(),
      value: item.value,
    }));
  }, [investmentsByType]);

  const cards = [
    {
      title: 'Receitas',
      value: formatCurrency(summary.totalIncome),
      icon: DollarSign,
      trend: '+12%',
      positive: true,
      color: 'text-primary-600 dark:text-primary-400 bg-transparent',
    },
    {
      title: 'Despesas',
      value: formatCurrency(summary.totalExpenses),
      icon: TrendingDown,
      trend: '-5%',
      positive: true,
      color: 'text-red-600 dark:text-red-400 bg-transparent',
    },
    {
      title: 'Saldo',
      value: formatCurrency(summary.balance),
      icon: Wallet,
      trend: formatPercent(summary.savingsRate),
      positive: summary.balance >= 0,
      color: 'text-blue-600 dark:text-blue-400 bg-transparent',
    },
    {
      title: 'Investimentos',
      value: formatCurrency(summary.totalInvested),
      icon: PiggyBank,
      trend: formatPercent(summary.investmentReturn),
      positive: summary.investmentReturn >= 0,
      color: 'text-amber-600 dark:text-amber-400 bg-transparent',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">Dashboard</h2>
        <p className="text-neutral-500 dark:text-neutral-400 mt-1">
          Visão geral das suas finanças
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card, index) => {
          const Icon = card.icon;
          return (
            <div
              key={index}
              className="card p-6 hover:shadow-soft transition-shadow duration-200"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
                    {card.title}
                  </p>
                  <p className="text-2xl font-bold text-neutral-900 dark:text-white mt-1">
                    {card.value}
                  </p>
                  <div className="flex items-center gap-1 mt-2">
                    <TrendingUp
                      className={`w-4 h-4 ${
                        card.positive ? 'text-primary-600' : 'text-red-600'
                      }`}
                    />
                    <span
                      className={`text-sm font-medium ${
                        card.positive ? 'text-primary-600' : 'text-red-600'
                      }`}
                    >
                      {card.trend}
                    </span>
                    <span className="text-sm text-neutral-400">vs mês passado</span>
                  </div>
                </div>
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${card.color}`}>
                  <Icon className="w-6 h-6" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Income vs Expenses Chart */}
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">
            Receitas vs Despesas
          </h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyData}>
                <defs>
                  <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => {
                    const [year, month] = value.split('-');
                    return `${month}/${year.slice(2)}`;
                  }}
                />
                <YAxis tick={{ fontSize: 12 }} tickFormatter={(value) => `R${(value / 1000).toFixed(0)}k`} />
                <Tooltip
                  formatter={(value: number) => formatCurrency(value)}
                  labelFormatter={(label) => {
                    const [year, month] = label.split('-');
                    return `${month}/${year}`;
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="income"
                  name="Receitas"
                  stroke="#22c55e"
                  fillOpacity={1}
                  fill="url(#colorIncome)"
                  strokeWidth={2}
                />
                <Area
                  type="monotone"
                  dataKey="expenses"
                  name="Despesas"
                  stroke="#ef4444"
                  fillOpacity={1}
                  fill="url(#colorExpenses)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Expense Categories */}
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">
            Despesas por Categoria
          </h3>
          <div className="h-72">
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => formatCurrency(value)} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-neutral-400">
                Nenhuma despesa registrada
              </div>
            )}
          </div>
          <div className="flex flex-wrap gap-2 mt-4 justify-center">
            {pieData.slice(0, 4).map((entry, index) => (
              <div key={entry.name} className="flex items-center gap-1 text-sm">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                />
                <span className="text-neutral-600 dark:text-neutral-400">{entry.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Investment Allocation */}
      {allocationData.length > 0 && (
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">
            Alocação de Investimentos
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={allocationData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {allocationData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}
