// src/hooks/useAvailableAgents.ts
import { useState, useEffect, useCallback } from 'react';
import { getAvailableAgents, type Agent } from '@/pages/chat/api/Agent/agentService';
import { useAuthShared } from '@/hooks/useAuthShared';

export const useAvailableAgents = () => {
  const { getAccessTokenSilently } = useAuthShared();
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAgents = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const token = await getAccessTokenSilently();
      const data = await getAvailableAgents(token);
      setAgents(data);
      return data;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to fetch agents';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [getAccessTokenSilently]);

  useEffect(() => {
    fetchAgents();
  }, [fetchAgents]);

  return {
    agents,
    loading,
    error,
    refresh: fetchAgents,
  };
};