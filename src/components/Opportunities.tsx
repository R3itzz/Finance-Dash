import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Star, Download } from 'lucide-react';
import { getInvestmentOpportunities } from '../services/b3Api';
import type { InvestmentOpportunity } from '../types';
import { formatCurrency, formatPercent } from '../utils/projections';

export function Opportunities() {
  const [opportunities, setOpportunities] = useState<InvestmentOpportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRealData, setIsRealData] = useState(false);
  const [filter, setFilter] = useState<'all' | 'stock' | 'fii'>('all');

  useEffect(() => {
    loadOpportunities();
  }, []);

  const loadOpportunities = async () => {
    setLoading(true);
    try {
      const { data, isReal } = await getInvestmentOpportunities();
      setOpportunities(data);
      setIsRealData(isReal);
    } catch (error) {
      console.error('Error loading opportunities:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredOpportunities = opportunities.filter((opp) => {
    if (filter === 'all') return true;
    return opp.type === filter;
  });

  const getRecommendationColor = (rec: InvestmentOpportunity['recommendation']) => {
    switch (rec) {
      case 'strong_buy':
        return 'bg-primary-600 text-white';
      case 'buy':
        return 'bg-primary-500 text-white';
      case 'hold':
        return 'bg-amber-500 text-white';
      case 'sell':
        return 'bg-red-500 text-white';
      default:
        return 'bg-neutral-500 text-white';
    }
  };

  const getRecommendationLabel = (rec: InvestmentOpportunity['recommendation']) => {
    switch (rec) {
      case 'strong_buy':
        return 'Compra Forte';
      case 'buy':
        return 'Compra';
      case 'hold':
        return 'Manter';
      case 'sell':
        return 'Venda';
      default:
        return rec;
    }
  };

  const exportToCSV = () => {
    const headers = ['Ticker', 'Nome', 'Tipo', 'Preço', 'DY', 'Score', 'Recomendação'];
    const rows = filteredOpportunities.map((opp) => [
      opp.ticker,
      opp.name,
      opp.type,
      opp.currentPrice,
      `${opp.dividendYield}%`,
      opp.score,
      getRecommendationLabel(opp.recommendation),
    ]);

    const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `oportunidades-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">
              Oportunidades
            </h2>
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 shadow-sm">
              <span 
                className={`w-2.5 h-2.5 rounded-full ${isRealData ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]' : 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)] animate-pulse'}`}
                title={isRealData ? "Dados reais via Alpha Vantage" : "Cache vazio - aguardando primeira busca"}
              ></span>
              <span className="text-[10px] font-bold uppercase tracking-wider opacity-70">
                {isRealData ? 'Live' : 'Demo'}
              </span>
            </div>
          </div>
          <p className="text-neutral-500 dark:text-neutral-400 mt-1">
            Melhores investimentos baseados em análise técnica e fundamentalista
          </p>
        </div>

        <button
          onClick={exportToCSV}
          className="btn-secondary flex items-center gap-2"
        >
          <Download className="w-4 h-4" />
          Exportar CSV
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        {(['all', 'stock', 'fii'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              filter === f
                ? 'bg-primary-600 text-white'
                : 'bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-700'
            }`}
          >
            {f === 'all' ? 'Todos' : f === 'stock' ? 'Ações' : 'FIIs'}
          </button>
        ))}
      </div>

      {/* Opportunities Grid */}
      {loading ? (
        <div className="card p-12 text-center text-neutral-500">Carregando...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredOpportunities.map((opp) => (
            <div key={opp.ticker} className="card p-6 hover:shadow-soft transition-shadow">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-lg font-bold text-neutral-900 dark:text-white">
                    {opp.ticker}
                  </p>
                  <p className="text-sm text-neutral-500">{opp.name}</p>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${getRecommendationColor(
                    opp.recommendation
                  )}`}
                >
                  {getRecommendationLabel(opp.recommendation)}
                </span>
              </div>

              {/* Score */}
              <div className="mb-4">
                <div className="flex items-center gap-1 mb-1">
                  <Star className="w-4 h-4 text-amber-500 fill-current" />
                  <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                    Score: {opp.score}/100
                  </span>
                </div>
                <div className="w-full bg-neutral-200 dark:bg-neutral-700 rounded-full h-2">
                  <div
                    className="bg-amber-500 h-2 rounded-full transition-all"
                    style={{ width: `${opp.score}%` }}
                  />
                </div>
              </div>

              {/* Metrics */}
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-neutral-500">Preço</span>
                  <span className="font-medium text-neutral-900 dark:text-white">
                    {formatCurrency(opp.currentPrice)}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-sm text-neutral-500">Dividend Yield</span>
                  <span className="font-medium text-primary-600">
                    {opp.dividendYield.toFixed(1)}%
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-sm text-neutral-500">Variação (24h)</span>
                  <span
                    className={`font-medium flex items-center gap-1 ${
                      opp.roi >= 0 ? 'text-primary-600' : 'text-red-600'
                    }`}
                  >
                    {opp.roi >= 0 ? (
                      <TrendingUp className="w-4 h-4" />
                    ) : (
                      <TrendingDown className="w-4 h-4" />
                    )}
                    {formatPercent(opp.roi)}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-sm text-neutral-500">Tendência 30d</span>
                  <span
                    className={`font-medium ${
                      opp.trend30d >= 0 ? 'text-primary-600' : 'text-red-600'
                    }`}
                  >
                    {formatPercent(opp.trend30d)}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-sm text-neutral-500">Tendência 90d</span>
                  <span
                    className={`font-medium ${
                      opp.trend90d >= 0 ? 'text-primary-600' : 'text-red-600'
                    }`}
                  >
                    {formatPercent(opp.trend90d)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Legend */}
      <div className="card p-4">
        <h4 className="font-medium text-neutral-900 dark:text-white mb-2">Sobre o Score</h4>
        <p className="text-sm text-neutral-500">
          O score é calculado considerando: dividend yield, tendência de preço nos últimos 30 e 90 dias,
          volume de negociação e estabilidade histórica. Quanto maior o score, melhor a oportunidade.
        </p>
      </div>
    </div>
  );
}
