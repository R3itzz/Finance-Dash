/**
 * Utilitários para cálculos de projeção financeira
 * Juros compostos, patrimônio futuro, etc.
 */

import type { ProjectionData, MonthlyProjection } from '../types';

/**
 * Calcula projeção de crescimento do patrimônio
 *
 * @param initialAmount - Valor inicial investido
 * @param monthlyContribution - Aporte mensal
 * @param annualReturn - Retorno anual esperado (%) - ex: 10 para 10%
 * @param years - Horizonte em anos
 * @returns Dados da projeção
 */
export function calculateProjection(
  initialAmount: number,
  monthlyContribution: number,
  annualReturn: number,
  years: number
): ProjectionData {
  const monthlyRate = annualReturn / 100 / 12;
  const totalMonths = years * 12;

  const monthlyData: MonthlyProjection[] = [];
  let currentValue = initialAmount;
  let totalContributed = initialAmount;

  for (let month = 0; month <= totalMonths; month++) {
    const date = new Date();
    date.setMonth(date.getMonth() + month);

    const interest = currentValue * monthlyRate;
    const contribution = month === 0 ? 0 : monthlyContribution;

    monthlyData.push({
      month,
      date: date.toISOString().split('T')[0],
      value: Math.round(currentValue * 100) / 100,
      contributed: Math.round(totalContributed * 100) / 100,
      interest: Math.round((currentValue - totalContributed) * 100) / 100,
    });

    currentValue += interest + contribution;
    totalContributed += contribution;
  }

  const totalInterest = currentValue - totalContributed;

  return {
    years,
    initialAmount,
    monthlyContribution,
    annualReturn,
    projectedValue: Math.round(currentValue * 100) / 100,
    totalContributed: Math.round(totalContributed * 100) / 100,
    totalInterest: Math.round(totalInterest * 100) / 100,
    monthlyData,
  };
}

/**
 * Calcula o período necessário para atingir um objetivo
 *
 * @param targetAmount - Valor alvo
 * @param initialAmount - Valor inicial
 * @param monthlyContribution - Aporte mensal
 * @param annualReturn - Retorno anual esperado (%)
 * @returns Meses necessários
 */
export function calculateTimeToGoal(
  targetAmount: number,
  initialAmount: number,
  monthlyContribution: number,
  annualReturn: number
): number {
  const monthlyRate = annualReturn / 100 / 12;
  let months = 0;
  let currentValue = initialAmount;

  while (currentValue < targetAmount && months < 1200) { // Max 100 anos
    currentValue = currentValue * (1 + monthlyRate) + monthlyContribution;
    months++;
  }

  return months;
}

/**
 * Calcula aporte mensal necessário para atingir objetivo
 *
 * @param targetAmount - Valor alvo
 * @param initialAmount - Valor inicial
 * @param annualReturn - Retorno anual esperado (%)
 * @param years - Prazo em anos
 * @returns Aporte mensal necessário
 */
export function calculateRequiredContribution(
  targetAmount: number,
  initialAmount: number,
  annualReturn: number,
  years: number
): number {
  const monthlyRate = annualReturn / 100 / 12;
  const months = years * 12;

  // Fórmula: PMT = (FV - PV*(1+r)^n) * r / ((1+r)^n - 1)
  const factor = Math.pow(1 + monthlyRate, months);
  const pmt = (targetAmount - initialAmount * factor) * monthlyRate / (factor - 1);

  return Math.max(0, Math.round(pmt * 100) / 100);
}

/**
 * Calcula montante futuro de uma série de pagamentos
 * Usado para calcular FGTS, previdência, etc.
 */
export function calculateFV(
  monthlyContribution: number,
  annualRate: number,
  years: number,
  initialAmount: number = 0
): number {
  const monthlyRate = annualRate / 100 / 12;
  const months = years * 12;
  const factor = Math.pow(1 + monthlyRate, months);

  // FV = PV * (1+r)^n + PMT * (((1+r)^n - 1) / r)
  const fv = initialAmount * factor +
             monthlyContribution * ((factor - 1) / monthlyRate);

  return Math.round(fv * 100) / 100;
}

/**
 * Calcula taxa interna de retorno (TIR) simplificada
 * Para investimentos com múltiplos aportes
 */
export function calculateIRR(
  cashFlows: number[],
  guess: number = 0.1
): number | null {
  const maxIterations = 100;
  const precision = 0.0001;

  let rate = guess;

  for (let i = 0; i < maxIterations; i++) {
    let npv = 0;
    let derivative = 0;

    for (let t = 0; t < cashFlows.length; t++) {
      const factor = Math.pow(1 + rate, t);
      npv += cashFlows[t] / factor;
      derivative -= t * cashFlows[t] / (factor * (1 + rate));
    }

    const newRate = rate - npv / derivative;

    if (Math.abs(newRate - rate) < precision) {
      return Math.round(rate * 10000) / 100; // Retorna em %
    }

    rate = newRate;
  }

  return null; // Não convergiu
}

/**
 * Formata valores monetários
 */
export function formatCurrency(value: number, currency: 'BRL' | 'USD' = 'BRL'): string {
  const locale = currency === 'BRL' ? 'pt-BR' : 'en-US';
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
  }).format(value);
}

/**
 * Formata percentuais
 */
export function formatPercent(value: number, decimals: number = 1): string {
  return `${value >= 0 ? '+' : ''}${value.toFixed(decimals)}%`;
}
