import { useState, useCallback, useMemo, useEffect } from 'react';
import type {
  Income,
  Expense,
  Investment,
  FinancialSummary,
} from '../types';

/**
 * Hook principal para gerenciar todos os dados financeiros
 * Centraliza CRUD de receitas, despesas e investimentos no servidor Node
 */
export function useFinanceData(userId?: string) {
  const [incomes, setIncomes] = useState<Income[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);

  // Fetch initial data
  useEffect(() => {
    if (!userId) {
      setIsLoading(false);
      return;
    }
    
    setIsLoading(true);
    fetch(`/api/finance/${userId}`, {
      headers: { 'Authorization': `Bearer ${import.meta.env.VITE_API_TOKEN}` }
    })
      .then(res => res.json())
      .then(res => {
        if (res.success && res.data) {
          setIncomes(res.data.incomes || []);
          setExpenses(res.data.expenses || []);
          setInvestments(res.data.investments || []);
        }
      })
      .catch(err => console.error("Error fetching finance data:", err))
      .finally(() => {
        setIsLoading(false);
        setIsInitialized(true);
      });
  }, [userId]);

  // Sync data to server automatically when state changes
  useEffect(() => {
    if (!userId || !isInitialized) return;

    fetch(`/api/finance/${userId}`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${import.meta.env.VITE_API_TOKEN}`
      },
      body: JSON.stringify({ incomes, expenses, investments })
    }).catch(err => console.error("Error saving finance data:", err));
  }, [incomes, expenses, investments, userId, isInitialized]);

  // Gerar ID unico
  const generateId = () => Math.random().toString(36).substring(2, 9);

  // === RECEITAS ===
  const addIncome = useCallback((income: Omit<Income, 'id'>) => {
    const newIncome: Income = { ...income, id: generateId() };
    setIncomes(prev => [newIncome, ...prev]);
    return newIncome;
  }, [setIncomes]);

  const removeIncome = useCallback((id: string) => {
    setIncomes(prev => prev.filter(i => i.id !== id));
  }, [setIncomes]);

  const updateIncome = useCallback((id: string, updates: Partial<Income>) => {
    setIncomes(prev => prev.map(i => i.id === id ? { ...i, ...updates } : i));
  }, [setIncomes]);

  // === DESPESAS ===
  const addExpense = useCallback((expense: Omit<Expense, 'id'>) => {
    const newExpense: Expense = { ...expense, id: generateId() };
    setExpenses(prev => [newExpense, ...prev]);
    return newExpense;
  }, [setExpenses]);

  const removeExpense = useCallback((id: string) => {
    setExpenses(prev => prev.filter(e => e.id !== id));
  }, [setExpenses]);

  const updateExpense = useCallback((id: string, updates: Partial<Expense>) => {
    setExpenses(prev => prev.map(e => e.id === id ? { ...e, ...updates } : e));
  }, [setExpenses]);

  // === INVESTIMENTOS ===
  const addInvestment = useCallback((investment: Omit<Investment, 'id'>) => {
    const newInvestment: Investment = { ...investment, id: generateId() };
    setInvestments(prev => [newInvestment, ...prev]);
    return newInvestment;
  }, [setInvestments]);

  const removeInvestment = useCallback((id: string) => {
    setInvestments(prev => prev.filter(i => i.id !== id));
  }, [setInvestments]);

  const updateInvestment = useCallback((id: string, updates: Partial<Investment>) => {
    setInvestments(prev => prev.map(i => i.id === id ? { ...i, ...updates } : i));
  }, [setInvestments]);

  // === CALCULOS ===
  const summary = useMemo<FinancialSummary>(() => {
    const totalIncome = incomes.reduce((sum, i) => sum + i.amount, 0);
    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
    const totalInvested = investments.reduce((sum, i) => sum + (i.quantity * i.avgPrice), 0);
    const currentInvestmentValue = investments.reduce(
      (sum, i) => sum + (i.quantity * i.currentPrice),
      0
    );

    return {
      totalIncome,
      totalExpenses,
      totalInvested,
      balance: totalIncome - totalExpenses,
      savingsRate: totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome) * 100 : 0,
      investmentReturn: totalInvested > 0
        ? ((currentInvestmentValue - totalInvested) / totalInvested) * 100
        : 0,
    };
  }, [incomes, expenses, investments]);

  // Dados mensais para graficos
  const monthlyData = useMemo(() => {
    const months = new Map<string, { income: number; expenses: number }>();

    // Agrupar receitas por mes
    incomes.forEach(income => {
      const month = income.date.substring(0, 7); // YYYY-MM
      const current = months.get(month) || { income: 0, expenses: 0 };
      months.set(month, { ...current, income: current.income + income.amount });
    });

    // Agrupar despesas por mes
    expenses.forEach(expense => {
      const month = expense.date.substring(0, 7);
      const current = months.get(month) || { income: 0, expenses: 0 };
      months.set(month, { ...current, expenses: current.expenses + expense.amount });
    });

    let dataList = Array.from(months.entries())
      .map(([month, data]) => ({ month, ...data }))
      .sort((a, b) => a.month.localeCompare(b.month));

    // Fix for Recharts Area rendering issue when only 1 data point exists
    if (dataList.length === 1) {
      const [year, month] = dataList[0].month.split('-');
      const prevDate = new Date(parseInt(year), parseInt(month) - 2, 1);
      const prevMonthStr = `${prevDate.getFullYear()}-${String(prevDate.getMonth() + 1).padStart(2, '0')}`;
      dataList = [{ month: prevMonthStr, income: 0, expenses: 0 }, ...dataList];
    } else if (dataList.length === 0) {
      const now = new Date();
      const currStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
      const prevDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const prevStr = `${prevDate.getFullYear()}-${String(prevDate.getMonth() + 1).padStart(2, '0')}`;
      dataList = [
        { month: prevStr, income: 0, expenses: 0 },
        { month: currStr, income: 0, expenses: 0 }
      ];
    }

    return dataList;
  }, [incomes, expenses]);

  // Dados para grafico de categorias de despesas
  const expensesByCategory = useMemo(() => {
    const categories = new Map<string, number>();
    expenses.forEach(expense => {
      const current = categories.get(expense.category) || 0;
      categories.set(expense.category, current + expense.amount);
    });
    return Array.from(categories.entries())
      .map(([category, amount]) => ({ category, amount }))
      .sort((a, b) => b.amount - a.amount);
  }, [expenses]);

  // Dados para grafico de alocacao de investimentos
  const investmentsByType = useMemo(() => {
    const types = new Map<string, number>();
    investments.forEach(inv => {
      const value = inv.quantity * inv.currentPrice;
      const current = types.get(inv.type) || 0;
      types.set(inv.type, current + value);
    });
    return Array.from(types.entries())
      .map(([type, value]) => ({ type, value }));
  }, [investments]);

  return {
    isLoading,
    // Dados
    incomes,
    expenses,
    investments,
    summary,
    monthlyData,
    expensesByCategory,
    investmentsByType,

    // Acoes - Receitas
    addIncome,
    removeIncome,
    updateIncome,

    // Acoes - Despesas
    addExpense,
    removeExpense,
    updateExpense,

    // Acoes - Investimentos
    addInvestment,
    removeInvestment,
    updateInvestment,
  };
}
