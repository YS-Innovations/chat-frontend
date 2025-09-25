// src/pages/chat/hooks/useAgentAssignment.ts
import { useState } from 'react';
import { 
  getAvailableAgents, 
  assignAgentToConversation, 
  unassignAgentFromConversation,
  type Agent 
} from '../../api/agentService';
import { useAuthShared } from '@/hooks/useAuthShared';

export function useAgentAssignment() {
  const { getAccessTokenSilently } = useAuthShared();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAvailableAgents = async (): Promise<Agent[]> => {
    try {
      setLoading(true);
      setError(null);
      const token = await getAccessTokenSilently();
      return await getAvailableAgents(token);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch available agents');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const assignAgent = async (conversationId: string, agentId: string): Promise<any> => {
    try {
      setLoading(true);
      setError(null);
      const token = await getAccessTokenSilently();
      return await assignAgentToConversation(conversationId, agentId, token);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to assign agent');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const unassignAgent = async (conversationId: string): Promise<any> => {
    try {
      setLoading(true);
      setError(null);
      const token = await getAccessTokenSilently();
      return await unassignAgentFromConversation(conversationId, token);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to unassign agent');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    fetchAvailableAgents,
    assignAgent,
    unassignAgent,
    clearError: () => setError(null),
  };
}