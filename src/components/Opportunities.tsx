import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Star } from 'lucide-react';
import { getInvestmentOpportunities } from '../services/b3Api';
import type { InvestmentOpportunity } from '../types';
import { formatCurrency, formatPercent } from '../utils/projections';

interface OpportunitiesProps {
  darkMode?: boolean;
}

export function Opportunities({ darkMode = false }: OpportunitiesProps) {
  const textPrimary = darkMode ? '#fff' : '#1c1917';
  const textSecondary = darkMode ? '#a1a1a1' : '#57534e';
  const textMuted = darkMode ? '#525252' : '#a8a29e';
  const bgCard = darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.7)';
  const borderCard = darkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)';
  const accent = darkMode ? '#c6f135' : '#65a30d';
  
  const cardStyle = { backgroundColor: bgCard, backdropFilter: 'blur(20px)', border: `1px solid ${borderCard}` };
  
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
      case 'strong_buy': return darkMode ? 'bg-[#c6f135] text-black' : 'bg-[#65a30d] text-white';
      case 'buy': return darkMode ? 'bg-[#c6f135] text-black' : 'bg-[#65a30d] text-white';
      case 'hold': return 'bg-amber-500 text-white';
      case 'sell': return 'bg-red-500 text-white';
      default: return 'bg-neutral-500 text-white';
    }
  };

  const getRecommendationLabel = (rec: InvestmentOpportunity['recommendation']) => {
    switch (rec) {
      case 'strong_buy': return 'Compra Forte';
      case 'buy': return 'Compra';
      case 'hold': return 'Manter';
      case 'sell': return 'Venda';
      default: return rec;
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

  const filterBtn = (f: 'all' | 'stock' | 'fii') => ({
    backgroundColor: filter === f ? accent : 'transparent',
    color: filter === f ? (darkMode ? '#000' : '#fff') : textSecondary,
    border: `1px solid ${filter === f ? accent : borderCard}`,
  });

  const gridBg = darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold" style={{ color: textPrimary }}>Oportunidades</h2>
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full" style={{ backgroundColor: gridBg, border: `1px solid ${borderCard}` }}>
              <span className={`w-2.5 h-2.5 rounded-full ${isRealData ? 'bg-green-500' : 'bg-red-500 animate-pulse'}`} />
              <span className="text-[10px] font-bold uppercase" style={{ opacity: 0.7 }}>{isRealData ? 'Live' : 'Demo'}</span>
            </div>
          </div>
          <p className="text-sm mt-1" style={{ color: textMuted }}>Melhores investimentos baseados em análise técnica e fundamentalista</p>
        </div>
        <button onClick={exportToCSV} className="btn-secondary flex items-center gap-2">Exportar CSV</button>
      </div>

      <div className="flex gap-2">
        {(['all', 'stock', 'fii'] as const).map((f) => (
          <button key={f} onClick={() => setFilter(f)} className="px-4 py-2 rounded-lg font-medium transition-all" style={filterBtn(f)}>
            {f === 'all' ? 'Todos' : f === 'stock' ? 'Ações' : 'FIIs'}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="glass-card p-12 text-center" style={cardStyle}>Carregando...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredOpportunities.map((opp) => (
            <div key={opp.ticker} className="glass-card" style={cardStyle}>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-lg font-bold" style={{ color: textPrimary }}>{opp.ticker}</p>
                  <p className="text-sm" style={{ color: textMuted }}>{opp.name}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getRecommendationColor(opp.recommendation)}`}>
                  {getRecommendationLabel(opp.recommendation)}
                </span>
              </div>

              <div className="mb-4">
                <div className="flex items-center gap-1 mb-1">
                  <Star className="w-4 h-4 text-amber-500 fill-current" />
                  <span className="text-sm font-medium" style={{ color: textSecondary }}>Score: {opp.score}/100</span>
                </div>
                <div className="w-full h-2 rounded-full" style={{ backgroundColor: gridBg }}>
                  <div className="bg-amber-500 h-2 rounded-full transition-all" style={{ width: `${opp.score}%` }} />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm" style={{ color: textMuted }}>Preço</span>
                  <span className="font-medium" style={{ color: textPrimary }}>{formatCurrency(opp.currentPrice)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm" style={{ color: textMuted }}>Dividend Yield</span>
                  <span className="font-medium" style={{ color: accent }}>{opp.dividendYield.toFixed(1)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm" style={{ color: textMuted }}>Variação (24h)</span>
                  <span className={`font-medium flex items-center gap-1 ${opp.roi >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {opp.roi >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                    {formatPercent(opp.roi)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm" style={{ color: textMuted }}>Tendência 30d</span>
                  <span className={`font-medium ${opp.trend30d >= 0 ? 'text-green-500' : 'text-red-500'}`}>{formatPercent(opp.trend30d)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="glass-card p-4" style={cardStyle}>
        <h4 className="font-medium mb-2" style={{ color: textPrimary }}>Sobre o Score</h4>
        <p className="text-sm" style={{ color: textMuted }}>
          O score é calculado considerando: dividend yield, tendência de preço nos últimos 30 e 90 dias, volume de negociação e estabilidade histórica.
        </p>
      </div>
    </div>
  );
}