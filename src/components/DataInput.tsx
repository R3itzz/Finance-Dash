import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
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
  { value: 'other', label: 'Outros' },
];

export function DataInput({
  incomes,
  expenses,
  onAddIncome,
  onAddExpense,
  onRemoveIncome,
  onRemoveExpense,
}: DataInputProps) {
  const [activeTab, setActiveTab] = useState<'income' | 'expense'>('income');
  const [showForm, setShowForm] = useState(false);

  // Form states
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [expenseType, setExpenseType] = useState<'fixed' | 'variable'>('variable');
  const [recurring, setRecurring] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const baseData = {
      description,
      amount: parseFloat(amount),
      date: format(new Date(), 'yyyy-MM-dd'),
    };

    if (activeTab === 'income') {
      onAddIncome({
        ...baseData,
        category: category as Income['category'],
        recurring,
      });
    } else {
      onAddExpense({
        ...baseData,
        category: category as Expense['category'],
        type: expenseType,
      });
    }

    // Reset form
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
      <div>
        <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">Lançamentos</h2>
        <p className="text-neutral-500 dark:text-neutral-400 mt-1">
          Registre suas receitas e despesas
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border border-terminal-secondary p-1 w-fit bg-terminal-highlight bg-opacity-30">
        <button
          onClick={() => setActiveTab('income')}
          className={`px-6 py-2 font-mono transition-all border border-transparent ${
            activeTab === 'income'
              ? 'bg-terminal-bg text-terminal-primary border-terminal-secondary'
              : 'text-terminal-text hover:text-terminal-primary'
          }`}
        >
          Receitas
        </button>
        <button
          onClick={() => setActiveTab('expense')}
          className={`px-6 py-2 font-mono transition-all border border-transparent ${
            activeTab === 'expense'
              ? 'bg-terminal-bg text-terminal-primary border-terminal-secondary'
              : 'text-terminal-text hover:text-terminal-primary'
          }`}
        >
          Despesas
        </button>
      </div>

      {/* Add Button */}
      {!showForm && (
        <button
          onClick={() => setShowForm(true)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Novo {activeTab === 'income' ? 'Receita' : 'Despesa'}
        </button>
      )}

      {/* Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="card p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                Descrição
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Ex: Salário, Aluguel, Supermercado"
                className="input"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                Valor (R$)
              </label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0,00"
                step="0.01"
                min="0"
                className="input"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                Categoria
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="input"
                required
              >
                <option value="">Selecione...</option>
                {(activeTab === 'income' ? incomeCategories : expenseCategories).map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {activeTab === 'expense' && (
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="expenseType"
                  value="fixed"
                  checked={expenseType === 'fixed'}
                  onChange={() => setExpenseType('fixed')}
                  className="w-4 h-4 text-primary-600"
                />
                <span className="text-sm text-neutral-700 dark:text-neutral-300">Fixa</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="expenseType"
                  value="variable"
                  checked={expenseType === 'variable'}
                  onChange={() => setExpenseType('variable')}
                  className="w-4 h-4 text-primary-600"
                />
                <span className="text-sm text-neutral-700 dark:text-neutral-300">Variável</span>
              </label>
            </div>
          )}

          {activeTab === 'income' && (
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={recurring}
                onChange={(e) => setRecurring(e.target.checked)}
                className="w-4 h-4 text-primary-600 rounded"
              />
              <span className="text-sm text-neutral-700 dark:text-neutral-300">Receita recorrente</span>
            </label>
          )}

          <div className="flex gap-2">
            <button type="submit" className="btn-primary">
              Salvar
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="btn-secondary"
            >
              Cancelar
            </button>
          </div>
        </form>
      )}

      {/* Transactions List */}
      <div className="card">
        <div className="p-4 border-b border-neutral-200 dark:border-neutral-700">
          <h3 className="font-semibold text-neutral-900 dark:text-white">
            Histórico
          </h3>
        </div>
        <div className="divide-y divide-neutral-200 dark:divide-neutral-700">
          {allTransactions.length === 0 ? (
            <div className="p-8 text-center text-neutral-500">
              Nenhum lançamento registrado
            </div>
          ) : (
            allTransactions.slice(0, 20).map((transaction) => (
              <div
                key={transaction.id}
                className="p-4 flex items-center justify-between hover:bg-neutral-50 dark:hover:bg-neutral-700/30"
              >
                <div className="flex-1">
                  <p className="font-medium text-neutral-900 dark:text-white">
                    {transaction.description}
                  </p>
                  <p className="text-sm text-neutral-500">
                    {format(new Date(transaction.date), 'dd/MM/yyyy', { locale: ptBR })} • {' '}
                    {transaction.category}
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  <span
                    className={`font-semibold ${
                      transaction.type === 'income'
                        ? 'text-primary-600'
                        : 'text-red-600'
                    }`}
                  >
                    {transaction.type === 'income' ? '+' : '-'}
                    {formatCurrency(transaction.amount)}
                  </span>

                  <button
                    onClick={() =>
                      transaction.type === 'income'
                        ? onRemoveIncome(transaction.id)
                        : onRemoveExpense(transaction.id)
                    }
                    className="p-2 text-neutral-400 hover:text-red-600 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
