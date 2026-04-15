import { useState, useCallback, useEffect } from 'react';
import type { Subscription } from '../types';

export function useSubscriptions(userId?: string) {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchSubscriptions = useCallback(async () => {
    if (!userId) {
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch(`/api/subscriptions/${userId}`, {
        headers: { 'Authorization': `Bearer ${import.meta.env.VITE_API_TOKEN}` }
      });
      const data = await res.json();
      
      if (data.success && data.subscriptions) {
        setSubscriptions(data.subscriptions);
      }
    } catch (err) {
      console.error('Error fetching subscriptions:', err);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchSubscriptions();
  }, [fetchSubscriptions]);

  const saveSubscriptions = useCallback(async (subs: Subscription[]) => {
    if (!userId) return;

    try {
      await fetch(`/api/subscriptions/${userId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_API_TOKEN}`
        },
        body: JSON.stringify({ subscriptions: subs })
      });
    } catch (err) {
      console.error('Error saving subscriptions:', err);
    }
  }, [userId]);

  const addSubscription = useCallback((subscription: Omit<Subscription, 'id'>) => {
    const newSub: Subscription = {
      ...subscription,
      id: Math.random().toString(36).substring(2, 9)
    };
    setSubscriptions(prev => {
      const updated = [...prev, newSub];
      saveSubscriptions(updated);
      return updated;
    });
    return newSub;
  }, [saveSubscriptions]);

  const removeSubscription = useCallback((id: string) => {
    setSubscriptions(prev => {
      const updated = prev.filter(s => s.id !== id);
      saveSubscriptions(updated);
      return updated;
    });
  }, [saveSubscriptions]);

  const updateSubscription = useCallback((id: string, updates: Partial<Subscription>) => {
    setSubscriptions(prev => {
      const updated = prev.map(s => s.id === id ? { ...s, ...updates } : s);
      saveSubscriptions(updated);
      return updated;
    });
  }, [saveSubscriptions]);

  const totalMonthly = subscriptions
    .filter(s => s.active)
    .reduce((sum, s) => sum + s.amount, 0);

  return {
    subscriptions,
    isLoading,
    addSubscription,
    removeSubscription,
    updateSubscription,
    totalMonthly,
  };
}