// src/hooks/useConversationSearch.ts
import { useState, useCallback } from 'react';
import { searchConversations, type SearchConversationsParams, type SearchConversationsResult } from '@/pages/chat/api/Chat/chatService';
import { useAuthShared } from '@/hooks/useAuthShared';

export const useConversationSearch = () => {
  const { getAccessTokenSilently } = useAuthShared();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<SearchConversationsResult | null>(null);

  const search = useCallback(async (params: SearchConversationsParams) => {
    try {
      setLoading(true);
      setError(null);
      const token = await getAccessTokenSilently();
      const data = await searchConversations(params, token);
      setResults(data);
      return data;
    } catch (err: any) {
      let errorMessage = 'Failed to search conversations';
      
      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [getAccessTokenSilently]);
  
  const clearResults = useCallback(() => {
    setResults(null);
    setError(null);
  }, []);

  return {
    loading,
    error,
    results,
    search,
    clearResults,
  };
};