import { useState } from 'react';
import { Plus, Trash2, ArrowUpRight, ArrowDownRight, DollarSign, Home, Utensils, Car, Heart, School, Film, ShoppingCart, Wifi, MoreHorizontal, Briefcase, TrendingUp, Zap } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { Income, Expense } from '../types';
import { formatCurrency } from '../utils/projections';

interface DataInputProps {
  incomes: Income[];
  expenses: Expense[];
  onAddIncome: (income: Omit<Income, 'id'>) => void;
  onAddExpense: (expense: Omit<Expense, 'id'>) => void;
  onRemoveIncome: (id: string) => void;
  onRemoveExpense: (id: string) => void;
  darkMode?: boolean;
}

const incomeCategories = [
  { value: 'salary', label: 'Salário' },
  { value: 'freelance', label: 'Freelance' },
  { value: 'investment_return', label: 'Rendimentos' },
  { value: 'other', label: 'Outros' },
];

const expenseCategories = [
  { value: 'housing', label: 'Moradia' },
  { value: 'food', label: 'Alimentação' },
  { value: 'transport', label: 'Transporte' },
  { value: 'health', label: 'Saúde' },
  { value: 'education', label: 'Educação' },
  { value: 'entertainment', label: 'Lazer' },
  { value: 'shopping', label: 'Compras' },
  { value: 'utilities', label: 'Contas' },
  { value: 'subscriptions', label: 'Assinaturas' },
  { value: 'other', label: 'Outros' },
];

const CATEGORY_ICONS: Record<string, React.ElementType> = {
  housing: Home, food: Utensils, transport: Car, health: Heart,
  education: School, entertainment: Film, shopping: ShoppingCart,
  utilities: Wifi, subscriptions: Zap, other: MoreHorizontal,
  salary: Briefcase, freelance: DollarSign, investment_return: TrendingUp,
};

export function DataInput({
  incomes,
  expenses,
  onAddIncome,
  onAddExpense,
  onRemoveIncome,
  onRemoveExpense,
  darkMode = false,
}: DataInputProps) {
  const [activeTab, setActiveTab] = useState<'income' | 'expense'>('income');
  const [showForm, setShowForm] = useState(false);
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [expenseType, setExpenseType] = useState<'fixed' | 'variable'>('variable');
  const [recurring, setRecurring] = useState(false);

  // Design tokens matching Dashboard
  const textPrimary = darkMode ? '#fff' : '#1c1917';
  const textSecondary = darkMode ? '#a1a1a1' : '#57534e';
  const textMuted = darkMode ? '#525252' : '#a8a29e';
  const bgCard = darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.7)';
  const bgInput = darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)';
  const borderColor = darkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)';
  const accentColor = darkMode ? '#c6f135' : '#65a30d';
  const tabColor = activeTab === 'income' ? accentColor : '#ef4444';
  const tabTextColor = activeTab === 'income' ? '#000' : '#fff';
  const cardStyle = { backgroundColor: bgCard, backdropFilter: 'blur(20px)', border: `1px solid ${borderColor}` };
  const inputStyle = {
    backgroundColor: bgInput,
    border: `1px solid ${borderColor}`,
    color: textPrimary,
    borderRadius: '10px',
    padding: '10px 14px',
    width: '100%',
    fontSize: '14px',
    outline: 'none',
    transition: 'border-color 0.2s',
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const baseData = {
      description,
      amount: parseFloat(amount),
      date: format(new Date(), 'yyyy-MM-dd'),
    };
    if (activeTab === 'income') {
      onAddIncome({ ...baseData, category: category as Income['category'], recurring });
    } else {
      onAddExpense({ ...baseData, category: category as Expense['category'], type: expenseType });
    }
    setDescription('');
    setAmount('');
    setCategory('');
    setRecurring(false);
    setShowForm(false);
  };

  const allTransactions = [
    ...incomes.map(i => ({ ...i, type: 'income' as const })),
    ...expenses.map(e => ({ ...e, type: 'expense' as const })),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-heading font-semibold" style={{ color: textPrimary }}>Lançamentos</h2>
          <p className="text-sm mt-1" style={{ color: textSecondary }}>Registre suas receitas e despesas</p>
        </div>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 hover:opacity-90"
            style={{ backgroundColor: activeTab === 'expense' ? '#ef4444' : accentColor, color: activeTab === 'expense' ? '#fff' : '#000' }}
          >
            <Plus className="w-4 h-4" />
            Nova {activeTab === 'income' ? 'Receita' : 'Despesa'}
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex rounded-xl p-1 w-fit" style={{ backgroundColor: darkMode ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.05)' }}>
        <button
          onClick={() => setActiveTab('income')}
          className="flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-medium transition-all duration-200"
          style={{
            backgroundColor: activeTab === 'income' ? accentColor : 'transparent',
            color: activeTab === 'income' ? '#000' : textSecondary,
          }}
        >
          <ArrowUpRight className="w-4 h-4" />
          Receitas
        </button>
        <button
          onClick={() => setActiveTab('expense')}
          className="flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-medium transition-all duration-200"
          style={{
            backgroundColor: activeTab === 'expense' ? '#ef4444' : 'transparent',
            color: activeTab === 'expense' ? '#fff' : textSecondary,
          }}
        >
          <ArrowDownRight className="w-4 h-4" />
          Despesas
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="glass-card rounded-2xl p-6" style={cardStyle}>
          <h3 className="font-medium mb-4 text-sm" style={{ color: textPrimary }}>
            Nova {activeTab === 'income' ? 'Receita' : 'Despesa'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-xs mb-1.5 font-medium" style={{ color: textSecondary }}>Descrição</label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Ex: Salário, Aluguel, Supermercado"
                  style={inputStyle}
                  required
                />
              </div>
              <div>
                <label className="block text-xs mb-1.5 font-medium" style={{ color: textSecondary }}>Valor (R$)</label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0,00"
                  step="0.01"
                  min="0"
                  style={inputStyle}
                  required
                />
              </div>
              <div>
                <label className="block text-xs mb-1.5 font-medium" style={{ color: textSecondary }}>Categoria</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  style={{ ...inputStyle, cursor: 'pointer' }}
                  required
                >
                  <option value="" style={{ backgroundColor: darkMode ? '#1c1c1c' : '#fff' }}>Selecione...</option>
                  {(activeTab === 'income' ? incomeCategories : expenseCategories).map((cat) => (
                    <option key={cat.value} value={cat.value} style={{ backgroundColor: darkMode ? '#1c1c1c' : '#fff' }}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {activeTab === 'expense' && (
              <div className="flex gap-4">
                {['fixed', 'variable'].map((type) => (
                  <label key={type} className="flex items-center gap-2 cursor-pointer">
                    <div
                      onClick={() => setExpenseType(type as 'fixed' | 'variable')}
                      className="w-4 h-4 rounded-full border-2 flex items-center justify-center cursor-pointer transition-all"
                      style={{
                        borderColor: expenseType === type ? tabColor : borderColor,
                        backgroundColor: expenseType === type ? tabColor : 'transparent',
                      }}
                    >
                      {expenseType === type && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </div>
                    <span className="text-sm" style={{ color: textSecondary }}>{type === 'fixed' ? 'Fixa' : 'Variável'}</span>
                  </label>
                ))}
              </div>
            )}

            {activeTab === 'income' && (
              <label className="flex items-center gap-2 cursor-pointer">
                <div
                  onClick={() => setRecurring(!recurring)}
                  className="w-4 h-4 rounded border-2 flex items-center justify-center cursor-pointer transition-all"
                  style={{
                    borderColor: recurring ? tabColor : borderColor,
                    backgroundColor: recurring ? tabColor : 'transparent',
                  }}
                >
                  {recurring && <div className="w-2 h-2 rounded-sm bg-black" />}
                </div>
                <span className="text-sm" style={{ color: textSecondary }}>Receita recorrente</span>
              </label>
            )}

            <div className="flex gap-2 pt-2">
              <button
                type="submit"
                className="px-5 py-2 rounded-xl text-sm font-medium transition-all duration-200"
                style={{ backgroundColor: tabColor, color: tabTextColor }}
              >
                Salvar
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-5 py-2 rounded-xl text-sm font-medium transition-all duration-200"
                style={{ backgroundColor: bgInput, color: textSecondary, border: `1px solid ${borderColor}` }}
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Transaction List */}
      <div className="glass-card rounded-2xl overflow-hidden" style={cardStyle}>
        <div className="px-6 py-4" style={{ borderBottom: `1px solid ${borderColor}` }}>
          <h3 className="font-medium text-sm" style={{ color: textPrimary }}>Histórico</h3>
        </div>
        <div>
          {allTransactions.length === 0 ? (
            <div className="py-12 text-center text-sm" style={{ color: textMuted }}>
              Nenhum lançamento registrado
            </div>
          ) : (
            allTransactions.slice(0, 20).map((transaction, i) => {
              const Icon = CATEGORY_ICONS[transaction.category] || DollarSign;
              const isIncome = transaction.type === 'income';
              const dateStr = format(new Date(transaction.date), 'dd MMM', { locale: ptBR });
              const catLabel = isIncome
                ? incomeCategories.find(c => c.value === transaction.category)?.label
                : expenseCategories.find(c => c.value === transaction.category)?.label;
              return (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between px-6 py-3.5 transition-all"
                  style={{
                    borderBottom: i < allTransactions.length - 1 ? `1px solid ${borderColor}` : 'none',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.backgroundColor = darkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)')}
                  onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: isIncome ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)' }}>
                      <Icon className="w-4 h-4" style={{ color: isIncome ? '#22c55e' : '#ef4444' }} />
                    </div>
                    <div>
                      <p className="text-sm font-medium" style={{ color: textPrimary }}>{transaction.description}</p>
                      <p className="text-xs mt-0.5" style={{ color: textMuted }}>{dateStr} · {catLabel || transaction.category}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-mono font-semibold" style={{ color: isIncome ? '#22c55e' : '#ef4444' }}>
                      {isIncome ? '+' : '-'}{formatCurrency(transaction.amount)}
                    </span>
                    <button
                      onClick={() => isIncome ? onRemoveIncome(transaction.id) : onRemoveExpense(transaction.id)}
                      className="p-1.5 rounded-lg transition-all"
                      style={{ color: textMuted }}
                      onMouseEnter={e => (e.currentTarget.style.color = '#ef4444')}
                      onMouseLeave={e => (e.currentTarget.style.color = textMuted)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
