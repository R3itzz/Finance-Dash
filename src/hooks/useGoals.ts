import { useState, useCallback, useEffect } from 'react';
import type { Goal } from '../types';

export function useGoals(userId?: string) {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchGoals = useCallback(async () => {
    if (!userId) {
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch(`/api/goals/${userId}`, {
        headers: { 'Authorization': `Bearer ${import.meta.env.VITE_API_TOKEN}` }
      });
      const data = await res.json();
      
      if (data.success && data.goals) {
        setGoals(data.goals);
      }
    } catch (err) {
      console.error('Error fetching goals:', err);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchGoals();
  }, [fetchGoals]);

  const saveGoals = useCallback(async (g: Goal[]) => {
    if (!userId) return;

    try {
      await fetch(`/api/goals/${userId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_API_TOKEN}`
        },
        body: JSON.stringify({ goals: g })
      });
    } catch (err) {
      console.error('Error saving goals:', err);
    }
  }, [userId]);

  const addGoal = useCallback((goal: Omit<Goal, 'id'>) => {
    const newGoal: Goal = {
      ...goal,
      id: Math.random().toString(36).substring(2, 9)
    };
    setGoals(prev => {
      const updated = [...prev, newGoal];
      saveGoals(updated);
      return updated;
    });
    return newGoal;
  }, [saveGoals]);

  const removeGoal = useCallback((id: string) => {
    setGoals(prev => {
      const updated = prev.filter(g => g.id !== id);
      saveGoals(updated);
      return updated;
    });
  }, [saveGoals]);

  const updateGoal = useCallback((id: string, updates: Partial<Goal>) => {
    setGoals(prev => {
      const updated = prev.map(g => g.id === id ? { ...g, ...updates } : g);
      saveGoals(updated);
      return updated;
    });
  }, [saveGoals]);

  const totalTarget = goals.reduce((sum, g) => sum + g.targetAmount, 0);
  const totalCurrent = goals.reduce((sum, g) => sum + g.currentAmount, 0);

  return {
    goals,
    isLoading,
    addGoal,
    removeGoal,
    updateGoal,
    totalTarget,
    totalCurrent,
  };
}