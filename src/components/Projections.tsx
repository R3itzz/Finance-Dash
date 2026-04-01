import { useState, useMemo } from 'react';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { Calculator, TrendingUp } from 'lucide-react';
import { calculateProjection, formatCurrency } from '../utils/projections';

interface ProjectionsProps {
  totalInvested: number;
  monthlyContribution: number;
}

export function Projections({ totalInvested, monthlyContribution }: ProjectionsProps) {
  const [initialAmount, setInitialAmount] = useState(totalInvested);
  const [contribution, setContribution] = useState(monthlyContribution);
  const [annualReturn, setAnnualReturn] = useState(12);
  const [years, setYears] = useState(10);

  const projection = useMemo(
    () => calculateProjection(initialAmount, contribution, annualReturn, years),
    [initialAmount, contribution, annualReturn, years]
  );

  const chartData = projection.monthlyData.filter((_, index) => index % 12 === 0);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">Projeções</h2>
        <p className="text-neutral-500 dark:text-neutral-400 mt-1">
          Simule o crescimento do seu patrimônio com juros compostos
        </p>
      </div>

      {/* Inputs */}
      <div className="card p-6">
        <h3 className="font-semibold text-neutral-900 dark:text-white mb-4 flex items-center gap-2">
          <Calculator className="w-5 h-5" />
          Parâmetros da Simulação
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
              Valor Inicial (R$)
            </label>
            <input
              type="number"
              value={initialAmount}
              onChange={(e) => setInitialAmount(Number(e.target.value))}
              className="input"
              min="0"
              step="1000"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
              Aporte Mensal (R$)
            </label>
            <input
              type="number"
              value={contribution}
              onChange={(e) => setContribution(Number(e.target.value))}
              className="input"
              min="0"
              step="100"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
              Retorno Anual (%)
            </label>
            <input
              type="number"
              value={annualReturn}
              onChange={(e) => setAnnualReturn(Number(e.target.value))}
              className="input"
              min="0"
              max="50"
              step="0.5"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
              Prazo (anos)
            </label>
            <input
              type="number"
              value={years}
              onChange={(e) => setYears(Number(e.target.value))}
              className="input"
              min="1"
              max="50"
              step="1"
            />
          </div>
        </div>
      </div>

      {/* Results Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card p-6">
          <p className="text-sm text-neutral-500">Valor Projetado</p>
          <p className="text-2xl font-bold text-neutral-900 dark:text-white">
            {formatCurrency(projection.projectedValue)}
          </p>
        </div>

        <div className="card p-6">
          <p className="text-sm text-neutral-500">Total Investido</p>
          <p className="text-2xl font-bold text-neutral-900 dark:text-white">
            {formatCurrency(projection.totalContributed)}
          </p>
        </div>

        <div className="card p-6">
          <p className="text-sm text-neutral-500">Juros Acumulados</p>
          <p className="text-2xl font-bold text-primary-600">
            {formatCurrency(projection.totalInterest)}
          </p>
        </div>

        <div className="card p-6">
          <p className="text-sm text-neutral-500">Retorno Total</p>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-primary-600" />
            <p className="text-2xl font-bold text-primary-600">
              {projection.totalContributed > 0
                ? ((projection.totalInterest / projection.totalContributed) * 100).toFixed(0)
                : 0}%
            </p>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="card p-6">
        <h3 className="font-semibold text-neutral-900 dark:text-white mb-4">
          Crescimento Projetado
        </h3>

        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorContributed" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>

              <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => {
                  const date = new Date(value);
                  return `${date.getFullYear()}`;
                }}
              />
              <YAxis
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => `R${(value / 1000).toFixed(0)}k`}
              />
              <Tooltip
                formatter={(value: number, name: string) => [
                  formatCurrency(value),
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
                stroke="#3b82f6"
                fill="url(#colorContributed)"
                strokeWidth={2}
              />

              <Area
                type="monotone"
                dataKey="value"
                name="value"
                stroke="#22c55e"
                fill="url(#colorValue)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="flex justify-center gap-6 mt-4">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-primary-500 rounded" />
            <span className="text-sm text-neutral-600">Valor Projetado</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-500 rounded" />
            <span className="text-sm text-neutral-600">Total Investido</span>
          </div>
        </div>
      </div>

      {/* Monthly Projection Table */}
      <div className="card overflow-hidden">
        <div className="p-4 border-b border-neutral-200 dark:border-neutral-700">
          <h3 className="font-semibold text-neutral-900 dark:text-white">
            Projeção Detalhada
          </h3>
        </div>

        <div className="overflow-x-auto max-h-96">
          <table className="w-full">
            <thead className="bg-neutral-50 dark:bg-neutral-800 sticky top-0">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                  Ano
                </th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                  Valor Total
                </th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                  Investido
                </th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                  Juros
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200 dark:divide-neutral-700">
              {projection.monthlyData
                .filter((_, index) => index % 12 === 0)
                .map((data) => {
                  const year = Math.floor(data.month / 12);
                  return (
                    <tr key={data.month} className="hover:bg-neutral-50 dark:hover:bg-neutral-700/30">
                      <td className="px-4 py-3 text-neutral-900 dark:text-white">
                        Ano {year}
                      </td>
                      <td className="px-4 py-3 text-right font-medium text-neutral-900 dark:text-white">
                        {formatCurrency(data.value)}
                      </td>
                      <td className="px-4 py-3 text-right text-neutral-600 dark:text-neutral-400">
                        {formatCurrency(data.contributed)}
                      </td>
                      <td className="px-4 py-3 text-right text-primary-600 font-medium">
                        {formatCurrency(data.interest)}
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
