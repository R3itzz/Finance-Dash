import { useState, useMemo } from 'react';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { Calculator, TrendingUp, LineChart } from 'lucide-react';
import { calculateProjection } from '../utils/projections';

interface ProjectionsProps {
  totalInvested: number;
  monthlyContribution: number;
  darkMode?: boolean;
}

const formatMoney = (value: number) => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 2 });

export function Projections({ totalInvested, monthlyContribution, darkMode = false }: ProjectionsProps) {
  const [initialAmount, setInitialAmount] = useState(totalInvested);
  const [contribution, setContribution] = useState(monthlyContribution);
  const [annualReturn, setAnnualReturn] = useState(12);
  const [years, setYears] = useState(10);

  const textColor = darkMode ? '#a1a1a1' : '#57534e';
  const textPrimary = darkMode ? '#ffffff' : '#1c1917';
  const bgColor = darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.7)';
  const borderColor = darkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)';
  const accent = darkMode ? '#c6f135' : '#65a30d';
  const chartGreen = darkMode ? '#4ade80' : '#22c55e';
  const chartBlue = darkMode ? '#60a5fa' : '#3b82f6';

  const projection = useMemo(
    () => calculateProjection(initialAmount, contribution, annualReturn, years),
    [initialAmount, contribution, annualReturn, years]
  );

  const chartData = projection.monthlyData.filter((_, index) => index % 12 === 0);

  const cardStyle = { backgroundColor: bgColor, backdropFilter: 'blur(20px)', border: `1px solid ${borderColor}` };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold" style={{ color: textPrimary }}>Projeções</h2>
        <p className="text-sm mt-1" style={{ color: textColor }}>
          Simule o crescimento do seu patrimônio com juros compostos
        </p>
      </div>

      <div className="rounded-2xl p-6" style={cardStyle}>
        <h3 className="font-semibold mb-5 flex items-center gap-2" style={{ color: textPrimary }}>
          <Calculator className="w-5 h-5" style={{ color: accent }} />
          Parâmetros da Simulação
        </h3>

<div className="grid grid-cols-1 md:grid-cols-4 gap-3 md:gap-4">
          <div>
            <label className="text-sm font-medium block mb-2" style={{ color: textColor }}>Valor Inicial (R$)</label>
            <input
              type="number"
              value={initialAmount}
              onChange={(e) => setInitialAmount(Number(e.target.value))}
              className="w-full px-4 py-3 rounded-xl border text-base font-mono"
              style={{
                backgroundColor: darkMode ? 'rgba(0,0,0,0.3)' : '#f5f5f4',
                borderColor: borderColor,
                color: textPrimary,
              }}
              min="0"
              step="1000"
            />
          </div>

          <div>
            <label className="text-sm font-medium block mb-2" style={{ color: textColor }}>Aporte Mensal (R$)</label>
            <input
              type="number"
              value={contribution}
              onChange={(e) => setContribution(Number(e.target.value))}
              className="w-full px-4 py-3 rounded-xl border text-base font-mono"
              style={{
                backgroundColor: darkMode ? 'rgba(0,0,0,0.3)' : '#f5f5f4',
                borderColor: borderColor,
                color: textPrimary,
              }}
              min="0"
              step="100"
            />
          </div>

          <div>
            <label className="text-sm font-medium block mb-2" style={{ color: textColor }}>Retorno Anual (%)</label>
            <input
              type="number"
              value={annualReturn}
              onChange={(e) => setAnnualReturn(Number(e.target.value))}
              className="w-full px-4 py-3 rounded-xl border text-base font-mono"
              style={{
                backgroundColor: darkMode ? 'rgba(0,0,0,0.3)' : '#f5f5f4',
                borderColor: borderColor,
                color: textPrimary,
              }}
              min="0"
              max="50"
              step="0.5"
            />
          </div>

          <div>
            <label className="text-sm font-medium block mb-2" style={{ color: textColor }}>Prazo (anos)</label>
            <input
              type="number"
              value={years}
              onChange={(e) => setYears(Number(e.target.value))}
              className="w-full px-4 py-3 rounded-xl border text-base font-mono"
              style={{
                backgroundColor: darkMode ? 'rgba(0,0,0,0.3)' : '#f5f5f4',
                borderColor: borderColor,
                color: textPrimary,
              }}
              min="1"
              max="50"
              step="1"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl" style={cardStyle}>
          <p className="text-sm" style={{ color: textColor }}>Valor Projetado</p>
          <p className="text-2xl font-mono font-bold" style={{ color: chartGreen }}>
            {formatMoney(projection.projectedValue)}
          </p>
        </div>

        <div className="p-5 rounded-2xl" style={cardStyle}>
          <p className="text-sm" style={{ color: textColor }}>Total Investido</p>
          <p className="text-2xl font-mono font-bold" style={{ color: textPrimary }}>
            {formatMoney(projection.totalContributed)}
          </p>
        </div>

        <div className="p-5 rounded-2xl" style={cardStyle}>
          <p className="text-sm" style={{ color: textColor }}>Juros Acumulados</p>
          <p className="text-2xl font-mono font-bold" style={{ color: chartGreen }}>
            {formatMoney(projection.totalInterest)}
          </p>
        </div>

        <div className="p-5 rounded-2xl" style={cardStyle}>
          <p className="text-sm" style={{ color: textColor }}>Retorno Total</p>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-6 h-6" style={{ color: chartGreen }} />
            <p className="text-2xl font-mono font-bold" style={{ color: chartGreen }}>
              {projection.totalContributed > 0
                ? ((projection.totalInterest / projection.totalContributed) * 100).toFixed(0)
                : 0}%
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-2xl p-6" style={cardStyle}>
        <h3 className="font-semibold mb-5 flex items-center gap-2" style={{ color: textPrimary }}>
          <LineChart className="w-5 h-5" style={{ color: accent }} />
          Crescimento Projetado
        </h3>

        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={chartGreen} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={chartGreen} stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorContributed" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={chartBlue} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={chartBlue} stopOpacity={0} />
                </linearGradient>
              </defs>

              <CartesianGrid strokeDasharray="3 3" stroke={borderColor} />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 12, fill: textColor }}
                tickFormatter={(value) => {
                  const date = new Date(value);
                  return `${date.getFullYear()}`;
                }}
              />
              <YAxis
                tick={{ fontSize: 12, fill: textColor }}
                tickFormatter={(value) => `R${(value / 1000).toFixed(0)}k`}
              />
              <Tooltip
                contentStyle={{ 
                  backgroundColor: darkMode ? '#171717' : '#fefefe', 
                  border: `1px solid ${borderColor}`, 
                  borderRadius: '12px' 
                }}
                formatter={(value: number, name: string) => [
                  formatMoney(value),
                  name === 'value' ? 'Valor Total' : 'Total Investido',
                ]}
                labelFormatter={(label) => {
                  const date = new Date(label);
                  return date.toLocaleDateString('pt-BR', { year: 'numeric', month: 'short' });
                }}
              />

              <Area
                type="monotone"
                dataKey="contributed"
                name="contributed"
                stroke={chartBlue}
                fill="url(#colorContributed)"
                strokeWidth={2}
              />

              <Area
                type="monotone"
                dataKey="value"
                name="value"
                stroke={chartGreen}
                fill="url(#colorValue)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="flex justify-center gap-6 mt-5">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded" style={{ backgroundColor: chartGreen }} />
            <span className="text-sm" style={{ color: textColor }}>Valor Projetado</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded" style={{ backgroundColor: chartBlue }} />
            <span className="text-sm" style={{ color: textColor }}>Total Investido</span>
          </div>
        </div>
      </div>

      <div className="rounded-2xl overflow-hidden" style={cardStyle}>
        <div className="p-4 border-b" style={{ borderColor, backgroundColor: darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)' }}>
          <h3 className="font-semibold" style={{ color: textPrimary }}>
            Projeção Detalhada
          </h3>
        </div>

        <div className="overflow-x-auto max-h-96">
          <table className="w-full">
            <thead style={{ backgroundColor: darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)' }}>
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium" style={{ color: textColor }}>Ano</th>
                <th className="px-4 py-3 text-right text-sm font-medium" style={{ color: textColor }}>Valor Total</th>
                <th className="px-4 py-3 text-right text-sm font-medium" style={{ color: textColor }}>Investido</th>
                <th className="px-4 py-3 text-right text-sm font-medium" style={{ color: textColor }}>Juros</th>
              </tr>
            </thead>
            <tbody className="divide-y" style={{ borderColor }}>
              {projection.monthlyData
                .filter((_, index) => index % 12 === 0)
                .map((data) => {
                  const year = Math.floor(data.month / 12);
                  return (
                    <tr key={data.month} className="transition-colors hover:opacity-80">
                      <td className="px-4 py-3" style={{ color: textPrimary }}>Ano {year}</td>
                      <td className="px-4 py-3 text-right font-mono font-medium" style={{ color: textPrimary }}>
                        {formatMoney(data.value)}
                      </td>
                      <td className="px-4 py-3 text-right font-mono" style={{ color: textColor }}>
                        {formatMoney(data.contributed)}
                      </td>
                      <td className="px-4 py-3 text-right font-mono font-medium" style={{ color: chartGreen }}>
                        {formatMoney(data.interest)}
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}