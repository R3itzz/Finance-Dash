import { useMemo, useState } from 'react';
import {
  ArrowUpRight,
  ArrowDownRight,
  PiggyBank,
  DollarSign,
  ShoppingCart,
  Home,
  Zap,
  Coffee,
  Film,
  Gamepad2,
  Plane,
  Utensils,
  Heart,
  School,
  Car,
  Wifi,
  Phone,
  Gift,
  MoreHorizontal,
  Target,
  TrendingUp,
  Wallet,
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
  Cell
} from 'recharts';
import type { useFinanceData } from '../hooks/useFinanceData';
import type { Subscription, Goal, Investment } from '../types';

interface DashboardProps {
  data: ReturnType<typeof useFinanceData>;
  darkMode?: boolean;
  metaMensal?: number;
  subscriptions?: Subscription[];
  goals?: Goal[];
  investments?: Investment[];
  onNavigateToSetting?: (settingId: string) => void;
  onNavigate?: (view: any) => void;
}

const EXPENSE_CATEGORIES: Record<string, { label: string; icon: React.ElementType; color: string }> = {
  housing: { label: 'Moradia', icon: Home, color: '#6366f1' },
  food: { label: 'Alimentação', icon: Utensils, color: '#f59e0b' },
  transport: { label: 'Transporte', icon: Car, color: '#8b5cf6' },
  health: { label: 'Saúde', icon: Heart, color: '#ec4899' },
  education: { label: 'Educação', icon: School, color: '#14b8a6' },
  entertainment: { label: 'Lazer', icon: Film, color: '#f97316' },
  shopping: { label: 'Compras', icon: ShoppingCart, color: '#06b6d4' },
  utilities: { label: 'Contas', icon: Wifi, color: '#84cc16' },
  subscriptions: { label: 'Assinaturas', icon: Zap, color: '#a855f7' },
  other: { label: 'Outros', icon: MoreHorizontal, color: '#6b7280' },
};

const CATEGORY_ICONS: Record<string, React.ElementType> = {
  housing: Home, food: Utensils, transport: Car, health: Heart,
  education: School, entertainment: Film, shopping: ShoppingCart,
  utilities: Wifi, subscriptions: Zap, phone: Phone, plane: Plane,
  game: Gamepad2, coffee: Coffee, gift: Gift, other: MoreHorizontal,
};

export function Dashboard({ data, darkMode = false, metaMensal, subscriptions = [], goals = [], investments = [], onNavigateToSetting, onNavigate }: DashboardProps) {
  const fontFamily = '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Helvetica Neue", sans-serif';
  const textPrimary = darkMode ? '#fff' : '#1c1917';
  const textSecondary = darkMode ? '#a1a1a1' : '#57534e';
  const textMuted = darkMode ? '#525252' : '#a8a29e';
  const bgCard = darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.7)';
  const bgIcon = darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)';
  const gridColor = darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)';
  const progressBg = darkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)';
  const borderColor = darkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)';

  const { summary, monthlyData, expensesByCategory, expenses, incomes } = data;
  const [viewMode, setViewMode] = useState<'all' | 'expense' | 'income'>('all');

  const recentTransactions = useMemo(() => {
    const merged = [
      ...expenses.map(e => ({ ...e, type: 'expense' as const })),
      ...incomes.map(i => ({ ...i, type: 'income' as const })),
    ];
    return merged.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5);
  }, [expenses, incomes]);

  const categoryData = useMemo(() => {
    return expensesByCategory.map(item => ({
      ...item,
      ...(EXPENSE_CATEGORIES[item.category] || { label: item.category, icon: MoreHorizontal, color: '#6b7280' }),
    }));
  }, [expensesByCategory]);

  const displayGoals = goals.slice(0, 3).map(g => ({ name: g.name, target: g.targetAmount, current: g.currentAmount }));

  const formatCurrency = (value: number) => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0 });
  const formatCurrencyBold = (value: number) => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0 });

  const cardStyle = { backgroundColor: bgCard, backdropFilter: 'blur(20px)', border: `1px solid ${borderColor}` };
  const headingStyle = { fontFamily, color: textPrimary };
  const metaMensalValue = metaMensal || 0;
  const metaProgress = Math.min((summary.balance / metaMensalValue) * 100, 100);
  const metaText = metaProgress >= 100 ? 'Meta atingida!' : `${Math.round(metaProgress)}% da meta`;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="glass-card lg:col-span-1" style={cardStyle}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium" style={{ color: textPrimary, fontFamily }}>Analítico</h3>
            <div className="flex rounded-lg p-1" style={{ backgroundColor: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }}>
              <button onClick={() => setViewMode('all')} className={`px-3 py-1 text-xs rounded-md ${viewMode === 'all' ? 'bg-accent text-black' : ''}`} style={{ color: viewMode === 'all' ? undefined : textSecondary }}>Ambos</button>
              <button onClick={() => setViewMode('income')} className={`px-3 py-1 text-xs rounded-md ${viewMode === 'income' ? 'bg-accent text-black' : ''}`} style={{ color: viewMode === 'income' ? undefined : textSecondary }}>Receitas</button>
              <button onClick={() => setViewMode('expense')} className={`px-3 py-1 text-xs rounded-md ${viewMode === 'expense' ? 'bg-accent text-black' : ''}`} style={{ color: viewMode === 'expense' ? undefined : textSecondary }}>Despesas</button>
            </div>
          </div>
          <div className="h-40">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyData}>
                <defs>
                  <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={darkMode ? '#4ade80' : '#22c55e'} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={darkMode ? '#4ade80' : '#22c55e'} stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={darkMode ? '#f87171' : '#ef4444'} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={darkMode ? '#f87171' : '#ef4444'} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                <XAxis dataKey="month" tick={{ fontSize: 10, fill: textMuted }} tickFormatter={(v) => v.split('-')[1]} />
                <YAxis hide />
                <Tooltip contentStyle={{ background: darkMode ? '#171717' : '#fefefe', border: `1px solid ${borderColor}`, borderRadius: '8px' }} labelStyle={{ color: textSecondary }} formatter={(v: number) => formatCurrency(v)} />
                {(viewMode === 'all' || viewMode === 'income') && (
                  <Area type="monotone" dataKey="income" name="Receitas" stroke={darkMode ? '#4ade80' : '#22c55e'} fillOpacity={1} fill="url(#colorIncome)" strokeWidth={2} />
                )}
                {(viewMode === 'all' || viewMode === 'expense') && (
                  <Area type="monotone" dataKey="expenses" name="Despesas" stroke={darkMode ? '#f87171' : '#ef4444'} fillOpacity={1} fill="url(#colorExpense)" strokeWidth={2} />
                )}
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-3 gap-2 mt-4">
            {categoryData.slice(0, 3).map((cat, i) => {
              const Icon = cat.icon;
              return (
                <div key={i} className="text-center">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center mx-auto mb-1" style={{ backgroundColor: bgIcon }}>
                    <Icon className="w-4 h-4" style={{ color: cat.color }} />
                  </div>
                  <p className="text-xs" style={{ color: textSecondary }}>{cat.label}</p>
                  <p className="text-xs font-mono" style={{ color: textPrimary }}>{Math.round((cat.amount / summary.totalExpenses) * 100)}%</p>
                </div>
              );
            })}
          </div>
        </div>

        <div className="glass-card lg:col-span-1" style={cardStyle}>
          <h3 className="font-medium" style={{ ...headingStyle, marginBottom: '0.25rem' }}>Gastos Totais</h3>
          <p className="text-3xl font-mono font-bold" style={{ color: textPrimary, marginBottom: '1rem' }}>{formatCurrencyBold(summary.totalExpenses)}</p>
          <div className="h-32">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={55}
                  paddingAngle={5}
                  dataKey="amount"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ background: darkMode ? '#171717' : '#fefefe', border: `1px solid ${borderColor}`, borderRadius: '8px' }}
                  itemStyle={{ fontSize: '12px' }}
                  formatter={(value: number) => formatCurrency(value)}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex items-center gap-2 mt-2">
            <div className="flex -space-x-2">
              {categoryData.slice(0, 4).map((cat, i) => {
                const Icon = cat.icon;
                return (
                  <div key={i} className="w-6 h-6 rounded-full flex items-center justify-center border-2" style={{ backgroundColor: bgIcon, borderColor: darkMode ? '#171717' : '#fafaf9' }}>
                    <Icon className="w-3 h-3" style={{ color: cat.color }} />
                  </div>
                );
              })}
            </div>
            <span className="text-xs" style={{ color: textSecondary }}>{categoryData[0]?.label || 'N/A'} em destaque</span>
          </div>
        </div>

        <div className="glass-card lg:col-span-1" style={cardStyle}>
          <h3 className="font-medium" style={{ ...headingStyle, marginBottom: '1rem' }}>Transações Recentes</h3>
          <div className="space-y-3">
            {recentTransactions.length > 0 ? recentTransactions.map((tx, i) => {
              const isIncome = tx.type === 'income';
              const Icon = isIncome ? ArrowUpRight : (CATEGORY_ICONS[tx.category] || DollarSign);
              const timeAgo = new Date(tx.date).toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' });
              return (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: isIncome ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)' }}>
                      <Icon className="w-4 h-4" style={{ color: isIncome ? '#22c55e' : '#ef4444' }} />
                    </div>
                    <div>
                      <p className="text-sm" style={{ color: textPrimary }}>{tx.description}</p>
                      <p className="text-xs" style={{ color: textMuted }}>{timeAgo}</p>
                    </div>
                  </div>
                  <span className={`text-sm font-mono ${isIncome ? 'text-green-400' : 'text-red-400'}`}>
                    {isIncome ? '+' : '-'}{formatCurrency(Math.abs(tx.amount))}
                  </span>
                </div>
              );
            }) : <p className="text-sm text-center py-4" style={{ color: textMuted }}>Nenhuma transação</p>}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {(() => {
          const totalSubs = subscriptions.reduce((sum, s) => sum + s.amount, 0);
          const topSubs = subscriptions.slice(0, 2).map(s => s.name).join(' • ') || 'Nenhuma';
          
          const statCards = [
            { icon: ArrowUpRight, label: 'Receitas', value: formatCurrencyBold(summary.totalIncome), change: '↑ 12%', changeColor: 'text-green-400', muted: 'vs mês anterior', view: 'input' },
            { icon: ArrowDownRight, label: 'Despesas', value: formatCurrencyBold(summary.totalExpenses), change: '↓ 5%', changeColor: 'text-red-400', muted: 'vs mês anterior', view: 'input' },
            { icon: Zap, label: 'Assinaturas', value: formatCurrencyBold(totalSubs), change: `${subscriptions.length} ativas`, changeColor: 'text-purple-400', muted: topSubs, id: 'assinaturas' },
            { icon: PiggyBank, label: 'Meta Mensal', value: formatCurrencyBold(metaMensalValue), change: metaText, changeColor: metaProgress >= 100 ? 'text-green-400' : 'text-accent', muted: `R$ ${formatCurrency(summary.balance)} guardados`, id: 'meta_mensal' },
          ];
          
          return statCards.map((item, i) => {
            const Icon = item.icon;
            return (
              <div key={i} className={`glass-card ${(item.id || item.view) ? 'cursor-pointer hover:border-accent/30 transition-colors' : ''}`} style={cardStyle} onClick={() => {
                if (item.id) onNavigateToSetting?.(item.id);
                if (item.view) onNavigate?.(item.view);
              }}>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: item.changeColor.replace('text-', '').replace('-400', '') === 'green' ? 'rgba(34,197,94,0.1)' : item.changeColor === 'text-red' ? 'rgba(239,68,68,0.1)' : item.changeColor === 'text-purple' ? 'rgba(168,85,247,0.1)' : 'rgba(198,241,53,0.1)' }}>
                    <Icon className="w-4 h-4" style={{ color: item.changeColor === 'text-accent' ? (darkMode ? '#c6f135' : '#65a30d') : item.changeColor === 'text-purple' ? '#a855f7' : undefined }} />
                  </div>
                  <span className="text-xs" style={{ color: textSecondary }}>{item.label}</span>
                </div>
                <p className="text-2xl font-mono font-bold" style={{ color: textPrimary }}>{item.value}</p>
                <div className="flex items-center gap-1 mt-2">
                  <span className={`text-xs ${item.changeColor}`}>{item.change}</span>
                  <span className="text-xs" style={{ color: textMuted }}>{item.muted}</span>
                </div>
              </div>
            );
          });
        })()}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="glass-card cursor-pointer hover:border-accent/30 transition-colors" style={cardStyle} onClick={() => onNavigateToSetting?.('minhas_metas')}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font font-medium" style={{ color: textPrimary }}>Minhas Metas</h3>
            {goals.length > 0 && (
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: darkMode ? 'rgba(198,241,53,0.1)' : 'rgba(101,163,13,0.1)' }}>
                <Target className="w-4 h-4" style={{ color: darkMode ? '#c6f135' : '#65a30d' }} />
              </div>
            )}
          </div>
          <div className="space-y-4">
            {goals.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8">
                <Target className="w-10 h-10 mb-3" style={{ color: textMuted }} />
                <p className="text-sm" style={{ color: textMuted }}>Você ainda não tem metas</p>
                <p className="text-xs mt-1" style={{ color: textMuted }}>Clique para adicionar</p>
              </div>
            ) : displayGoals.map((goal, i) => {
              const progress = (goal.current / goal.target) * 100;
              return (
                <div key={i}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Target className="w-4 h-4" style={{ color: darkMode ? '#c6f135' : '#65a30d' }} />
                      <span className="text-sm" style={{ color: textPrimary }}>{goal.name}</span>
                    </div>
                    <span className="text-sm font-mono font-bold" style={{ color: progress >= 100 ? '#22c55e' : textSecondary }}>
                      {formatCurrency(goal.current)} / {formatCurrency(goal.target)}
                    </span>
                  </div>
                  <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: progressBg }}>
                    <div className="h-full rounded-full transition-all duration-500" style={{ width: `${Math.min(progress, 100)}%`, backgroundColor: progress >= 100 ? '#22c55e' : (darkMode ? '#c6f135' : '#65a30d') }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="glass-card cursor-pointer hover:border-accent/30 transition-colors" style={cardStyle} onClick={() => onNavigate?.('investments')}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font font-medium" style={{ color: textPrimary }}>Carteira</h3>
            {investments.length > 0 && (
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: darkMode ? 'rgba(198,241,53,0.1)' : 'rgba(101,163,13,0.1)' }}>
                <TrendingUp className="w-4 h-4" style={{ color: darkMode ? '#c6f135' : '#65a30d' }} />
              </div>
            )}
          </div>
          {investments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8">
              <Wallet className="w-10 h-10 mb-3" style={{ color: textMuted }} />
              <p className="text-sm" style={{ color: textMuted }}>Você ainda não tem investimentos</p>
              <p className="text-xs mt-1" style={{ color: textMuted }}>Clique em Carteira para adicionar</p>
            </div>
          ) : (
            <div className="space-y-3">
              {investments.slice(0, 4).map((inv, i) => {
                const totalValue = inv.quantity * inv.currentPrice;
                const variation = ((inv.currentPrice - inv.avgPrice) / inv.avgPrice) * 100;
                return (
                  <div key={i} className="flex items-center justify-between p-3 rounded-xl" style={{ backgroundColor: darkMode ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)' }}>
                    <div>
                      <p className="font-medium text-sm" style={{ color: textPrimary }}>{inv.ticker}</p>
                      <p className="text-xs" style={{ color: textMuted }}>{inv.quantity} cotas</p>
                    </div>
                    <div className="text-right">
                      <p className="font-mono font-medium text-sm" style={{ color: textPrimary }}>{formatCurrency(totalValue)}</p>
                      <p className="text-xs font-mono" style={{ color: variation >= 0 ? '#22c55e' : '#ef4444' }}>
                        {variation >= 0 ? '+' : ''}{variation.toFixed(2)}%
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}