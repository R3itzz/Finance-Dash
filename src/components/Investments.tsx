import { useState } from 'react';
import { Plus, Trash2, RefreshCw, TrendingUp, TrendingDown } from 'lucide-react';
import type { Investment, InvestmentType } from '../types';
import { getMarketData, updateInvestmentPrices } from '../services/b3Api';
import { formatCurrency, formatPercent } from '../utils/projections';

interface InvestmentsProps {
  investments: Investment[];
  onAdd: (investment: Omit<Investment, 'id'>) => void;
  onRemove: (id: string) => void;
  onUpdate: (id: string, updates: Partial<Investment>) => void;
}

const investmentTypes: { value: InvestmentType; label: string }[] = [
  { value: 'stock', label: 'Ação' },
  { value: 'fii', label: 'FII' },
  { value: 'bond', label: 'Renda Fixa' },
  { value: 'crypto', label: 'Cripto' },
  { value: 'other', label: 'Outro' },
];

export function Investments({ investments, onAdd, onRemove, onUpdate }: InvestmentsProps) {
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);

  // Form state
  const [ticker, setTicker] = useState('');
  const [name, setName] = useState('');
  const [type, setType] = useState<InvestmentType>('stock');
  const [quantity, setQuantity] = useState('');
  const [avgPrice, setAvgPrice] = useState('');

  const totalValue = investments.reduce((sum, i) => sum + i.quantity * i.currentPrice, 0);
  const totalCost = investments.reduce((sum, i) => sum + i.quantity * i.avgPrice, 0);
  const totalReturn = totalValue - totalCost;
  const returnPercent = totalCost > 0 ? (totalReturn / totalCost) * 100 : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Tenta buscar preço atual da API
      const marketData = await getMarketData(ticker.toUpperCase());
      const currentPrice = marketData?.price || parseFloat(avgPrice);

      onAdd({
        ticker: ticker.toUpperCase(),
        name: name || ticker.toUpperCase(),
        type,
        quantity: parseFloat(quantity),
        avgPrice: parseFloat(avgPrice),
        currentPrice,
        lastUpdated: new Date().toISOString(),
        dividendYield: marketData?.dividendYield,
      });

      // Reset form
      setTicker('');
      setName('');
      setQuantity('');
      setAvgPrice('');
      setShowForm(false);
    } catch (error) {
      console.error('Error adding investment:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setLoading(true);
    const tickers = investments.map(i => i.ticker);
    const prices = await updateInvestmentPrices(tickers);

    prices.forEach((price, ticker) => {
      const investment = investments.find(i => i.ticker === ticker);
      if (investment) {
        onUpdate(investment.id, { currentPrice: price });
      }
    });

    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">Carteira</h2>
          <p className="text-neutral-500 dark:text-neutral-400 mt-1">
            Gerencie seus investimentos
          </p>
        </div>

        <button
          onClick={handleRefresh}
          disabled={loading}
          className="btn-secondary flex items-center gap-2"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Atualizar Preços
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card p-6">
          <p className="text-sm text-neutral-500">Valor Total</p>
          <p className="text-2xl font-bold text-neutral-900 dark:text-white">
            {formatCurrency(totalValue)}
          </p>
        </div>

        <div className="card p-6">
          <p className="text-sm text-neutral-500">Custo Total</p>
          <p className="text-2xl font-bold text-neutral-900 dark:text-white">
            {formatCurrency(totalCost)}
          </p>
        </div>

        <div className="card p-6">
          <p className="text-sm text-neutral-500">Resultado</p>
          <div className="flex items-center gap-2">
            <p
              className={`text-2xl font-bold ${
                totalReturn >= 0 ? 'text-primary-600' : 'text-red-600'
              }`}
            >
              {totalReturn >= 0 ? '+' : ''}
              {formatCurrency(totalReturn)}
            </p>
            <span
              className={`text-sm font-medium ${
                returnPercent >= 0 ? 'text-primary-600' : 'text-red-600'
              }`}
            >
              ({formatPercent(returnPercent)})
            </span>
          </div>
        </div>
      </div>

      {/* Add Button */}
      {!showForm && (
        <button
          onClick={() => setShowForm(true)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Novo Investimento
        </button>
      )}

      {/* Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="card p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                Ticker
              </label>
              <input
                type="text"
                value={ticker}
                onChange={(e) => setTicker(e.target.value.toUpperCase())}
                placeholder="PETR4"
                className="input"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                Nome
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Petrobras"
                className="input"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                Tipo
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as InvestmentType)}
                className="input"
                required
              >
                {investmentTypes.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                Quantidade
              </label>
              <input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="100"
                step="1"
                min="0"
                className="input"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                Preço Médio (R$)
              </label>
              <input
                type="number"
                value={avgPrice}
                onChange={(e) => setAvgPrice(e.target.value)}
                placeholder="35,00"
                step="0.01"
                min="0"
                className="input"
                required
              />
            </div>
          </div>

          <div className="flex gap-2">
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Salvando...' : 'Salvar'}
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

      {/* Investments List */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-neutral-50 dark:bg-neutral-800">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                  Ativo
                </th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                  Quantidade
                </th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                  Preço Médio
                </th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                  Preço Atual
                </th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                  Valor Total
                </th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                  Resultado
                </th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200 dark:divide-neutral-700">
              {investments.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-neutral-500">
                    Nenhum investimento registrado
                  </td>
                </tr>
              ) : (
                investments.map((inv) => {
                  const totalValue = inv.quantity * inv.currentPrice;
                  const totalCost = inv.quantity * inv.avgPrice;
                  const result = totalValue - totalCost;
                  const resultPercent = (result / totalCost) * 100;

                  return (
                    <tr key={inv.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-700/30">
                      <td className="px-4 py-4">
                        <div>
                          <p className="font-medium text-neutral-900 dark:text-white">{inv.ticker}</p>
                          <p className="text-sm text-neutral-500">{inv.name}</p>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-right text-neutral-900 dark:text-white">
                        {inv.quantity}
                      </td>
                      <td className="px-4 py-4 text-right text-neutral-900 dark:text-white">
                        {formatCurrency(inv.avgPrice)}
                      </td>
                      <td className="px-4 py-4 text-right text-neutral-900 dark:text-white">
                        {formatCurrency(inv.currentPrice)}
                      </td>
                      <td className="px-4 py-4 text-right text-neutral-900 dark:text-white">
                        {formatCurrency(totalValue)}
                      </td>
                      <td className="px-4 py-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {result >= 0 ? (
                            <TrendingUp className="w-4 h-4 text-primary-600" />
                          ) : (
                            <TrendingDown className="w-4 h-4 text-red-600" />
                          )}
                          <span
                            className={
                              result >= 0 ? 'text-primary-600' : 'text-red-600'
                            }
                          >
                            {formatCurrency(result)} ({formatPercent(resultPercent)})
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <button
                          onClick={() => onRemove(inv.id)}
                          className="p-2 text-neutral-400 hover:text-red-600 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
