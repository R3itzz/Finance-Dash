import { useState } from 'react';
import { Plus, Trash2, TrendingUp, TrendingDown, Wallet, X, RefreshCw } from 'lucide-react';
import type { Investment, InvestmentType } from '../types';
import { getMarketData, updateInvestmentPrices } from '../services/b3Api';

interface InvestmentsComponentProps {
  investments: Investment[];
  onAdd: (investment: Omit<Investment, 'id'>) => void;
  onRemove: (id: string) => void;
  onUpdate?: (id: string, updates: Partial<Investment>) => void;
  darkMode?: boolean;
}

const investmentTypes: { value: InvestmentType; label: string }[] = [
  { value: 'stock', label: 'Ação' },
  { value: 'fii', label: 'FII' },
  { value: 'bond', label: 'Renda Fixa' },
  { value: 'crypto', label: 'Cripto' },
  { value: 'other', label: 'Outro' },
];

const formatMoney = (value: number) => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 2 });
const formatPercent = (value: number) => value.toFixed(2) + '%';

interface InvestmentsComponentProps {
  investments: Investment[];
  onAdd: (investment: Omit<Investment, 'id'>) => void;
  onRemove: (id: string) => void;
  onUpdate?: (id: string, updates: Partial<Investment>) => void;
  darkMode?: boolean;
}

export function Investments({ investments, onAdd, onRemove, onUpdate, darkMode = false }: InvestmentsComponentProps) {
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);

  const textColor = darkMode ? '#a1a1a1' : '#57534e';
  const textPrimary = darkMode ? '#ffffff' : '#1c1917';
  const bgColor = darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.7)';
  const borderColor = darkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)';
  const accent = darkMode ? '#c6f135' : '#65a30d';

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

  const cardStyle = { backgroundColor: bgColor, backdropFilter: 'blur(20px)', border: `1px solid ${borderColor}` };

  const handleRefresh = async () => {
    if (investments.length === 0 || !onUpdate) return;
    
    setLoading(true);
    try {
      const tickers = investments.map(i => i.ticker);
      const prices = await updateInvestmentPrices(tickers);
      
      prices.forEach((price, ticker) => {
        const inv = investments.find(i => i.ticker === ticker);
        if (inv && price) {
          onUpdate(inv.id, { currentPrice: price, lastUpdated: new Date().toISOString() });
        }
      });
    } catch (error) {
      console.error('Error refreshing prices:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold" style={{ color: textPrimary }}>Carteira</h2>
          <p className="text-sm mt-1" style={{ color: textColor }}>Gerencie seus investimentos</p>
        </div>
        {investments.length > 0 && (
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="px-4 py-2 rounded-xl flex items-center gap-2 font-medium transition-all hover:scale-105"
            style={{ 
              backgroundColor: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
              color: textColor 
            }}
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Atualizar Preços
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
        <div className="p-3 md:p-5 rounded-2xl" style={cardStyle}>
          <p className="text-sm" style={{ color: textColor }}>Valor Total</p>
          <p className="text-xl md:text-2xl font-mono font-bold" style={{ color: textPrimary }}>
            {formatMoney(totalValue)}
          </p>
        </div>

        <div className="p-3 md:p-5 rounded-2xl" style={cardStyle}>
          <p className="text-sm" style={{ color: textColor }}>Custo Total</p>
          <p className="text-xl md:text-2xl font-mono font-bold" style={{ color: textPrimary }}>
            {formatMoney(totalCost)}
          </p>
        </div>

        <div className="p-3 md:p-5 rounded-2xl" style={cardStyle}>
          <p className="text-sm" style={{ color: textColor }}>Resultado</p>
          <div className="flex items-center gap-2">
            <p className="text-2xl font-mono font-bold" style={{ color: totalReturn >= 0 ? '#22c55e' : '#ef4444' }}>
              {totalReturn >= 0 ? '+' : ''}{formatMoney(totalReturn)}
            </p>
            <span className="text-sm font-medium" style={{ color: returnPercent >= 0 ? '#22c55e' : '#ef4444' }}>
              ({formatPercent(returnPercent)})
            </span>
          </div>
        </div>
      </div>

      {!showForm && (
        <button
          onClick={() => setShowForm(true)}
          className="px-5 py-3 rounded-xl flex items-center gap-2 font-medium transition-all duration-300 hover:scale-105"
          style={{ 
            backgroundColor: accent, 
            color: darkMode ? '#000' : '#fff',
            boxShadow: `0 4px 15px ${accent}40`
          }}
        >
          <Plus className="w-5 h-5" />
          Novo Investimento
        </button>
      )}

      {showForm && (
        <form onSubmit={handleSubmit} className="rounded-2xl p-4 md:p-6 space-y-5" style={{ 
          backgroundColor: darkMode ? 'rgba(255,255,255,0.08)' : '#fff',
          border: `1px solid ${borderColor}`
        }}>
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold" style={{ color: textPrimary }}>Novo Investimento</h3>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="p-2 rounded-lg transition-colors"
              style={{ color: textColor }}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium block mb-2" style={{ color: textColor }}>Ticker</label>
              <input
                type="text"
                value={ticker}
                onChange={(e) => setTicker(e.target.value.toUpperCase())}
                placeholder="PETR4"
                className="w-full px-4 py-3 rounded-xl border text-base"
                style={{
                  backgroundColor: darkMode ? 'rgba(0,0,0,0.3)' : '#f5f5f4',
                  borderColor: borderColor,
                  color: textPrimary,
                }}
                required
              />
            </div>

            <div>
              <label className="text-sm font-medium block mb-2" style={{ color: textColor }}>Nome (opcional)</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Petrobras"
                className="w-full px-4 py-3 rounded-xl border text-base"
                style={{
                  backgroundColor: darkMode ? 'rgba(0,0,0,0.3)' : '#f5f5f4',
                  borderColor: borderColor,
                  color: textPrimary,
                }}
              />
            </div>

            <div>
              <label className="text-sm font-medium block mb-2" style={{ color: textColor }}>Tipo</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as InvestmentType)}
                className="w-full px-4 py-3 rounded-xl border text-base"
                style={{
                  backgroundColor: darkMode ? 'rgba(0,0,0,0.3)' : '#f5f5f4',
                  borderColor: borderColor,
                  color: textPrimary,
                }}
                required
              >
                {investmentTypes.map((t) => (
                  <option key={t.value} value={t.value} style={{ color: textPrimary }}>{t.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-medium block mb-2" style={{ color: textColor }}>Quantidade</label>
              <input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="100"
                step="1"
                min="0"
                className="w-full px-4 py-3 rounded-xl border text-base"
                style={{
                  backgroundColor: darkMode ? 'rgba(0,0,0,0.3)' : '#f5f5f4',
                  borderColor: borderColor,
                  color: textPrimary,
                }}
                required
              />
            </div>

            <div className="md:col-span-2">
              <label className="text-sm font-medium block mb-2" style={{ color: textColor }}>Preço Médio (R$)</label>
              <input
                type="number"
                value={avgPrice}
                onChange={(e) => setAvgPrice(e.target.value)}
                placeholder="35,00"
                step="0.01"
                min="0"
                className="w-full px-4 py-3 rounded-xl border text-base font-mono"
                style={{
                  backgroundColor: darkMode ? 'rgba(0,0,0,0.3)' : '#f5f5f4',
                  borderColor: borderColor,
                  color: textPrimary,
                }}
                required
              />
            </div>
          </div>

          <div className="flex gap-4">
            <button 
              type="submit" 
              disabled={loading}
              className="flex-1 py-3 rounded-xl font-medium transition-all duration-300"
              style={{ 
                backgroundColor: accent, 
                color: darkMode ? '#000' : '#fff',
                opacity: loading ? 0.7 : 1
              }}
            >
              {loading ? 'Salvando...' : 'Salvar'}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-6 py-3 rounded-xl font-medium transition-colors"
              style={{ 
                backgroundColor: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
                color: textColor 
              }}
            >
              Cancelar
            </button>
          </div>
        </form>
      )}

      <div className="rounded-2xl overflow-x-auto" style={cardStyle}>
        {investments.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <Wallet className="w-14 h-14 mb-4 opacity-30" style={{ color: textColor }} />
            <p className="font-medium" style={{ color: textColor }}>Nenhum investimento registrado</p>
            <p className="text-sm mt-1 opacity-70" style={{ color: textColor }}>Clique em "Novo Investimento" para começar</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead style={{ backgroundColor: darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)' }}>
                <tr>
                  <th className="px-5 py-4 text-left text-sm font-medium" style={{ color: textColor }}>Ativo</th>
                  <th className="px-5 py-4 text-right text-sm font-medium" style={{ color: textColor }}>Qtd</th>
                  <th className="px-5 py-4 text-right text-sm font-medium" style={{ color: textColor }}>Custo Médio</th>
                  <th className="px-5 py-4 text-right text-sm font-medium" style={{ color: textColor }}>Preço Atual</th>
                  <th className="px-5 py-4 text-right text-sm font-medium" style={{ color: textColor }}>Valor Total</th>
                  <th className="px-5 py-4 text-right text-sm font-medium" style={{ color: textColor }}>Resultado</th>
                  <th className="px-5 py-4 text-center text-sm font-medium" style={{ color: textColor }}></th>
                </tr>
              </thead>
              <tbody className="divide-y" style={{ borderColor }}>
                {investments.map((inv) => {
                  const totalInvValue = inv.quantity * inv.currentPrice;
                  const totalInvCost = inv.quantity * inv.avgPrice;
                  const result = totalInvValue - totalInvCost;
                  const resultPercent = totalInvCost > 0 ? (result / totalInvCost) * 100 : 0;
                  const isPositive = result >= 0;

                  return (
                    <tr key={inv.id} className="transition-colors hover:opacity-80">
                      <td className="px-5 py-4">
                        <div>
                          <p className="font-bold" style={{ color: textPrimary }}>{inv.ticker}</p>
                          <p className="text-sm" style={{ color: textColor }}>{inv.name}</p>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-right font-mono" style={{ color: textPrimary }}>
                        {inv.quantity}
                      </td>
                      <td className="px-5 py-4 text-right font-mono" style={{ color: textPrimary }}>
                        {formatMoney(inv.avgPrice)}
                      </td>
                      <td className="px-5 py-4 text-right font-mono" style={{ color: textPrimary }}>
                        {formatMoney(inv.currentPrice)}
                      </td>
                      <td className="px-5 py-4 text-right font-mono" style={{ color: textPrimary }}>
                        {formatMoney(totalInvValue)}
                      </td>
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {isPositive ? (
                            <TrendingUp className="w-4 h-4" style={{ color: '#22c55e' }} />
                          ) : (
                            <TrendingDown className="w-4 h-4" style={{ color: '#ef4444' }} />
                          )}
                          <span className="font-mono" style={{ color: isPositive ? '#22c55e' : '#ef4444' }}>
                            {isPositive ? '+' : ''}{formatMoney(result)} ({formatPercent(resultPercent)})
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-center">
                        <button
                          onClick={() => onRemove(inv.id)}
                          className="p-2 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}