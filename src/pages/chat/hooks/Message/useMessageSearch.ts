// src/hooks/useMessageSearch.ts
import { useState } from 'react';
import { searchMessagesInConversation } from '../../api/Chat/chatService';
import type { Message } from '../../types/ChatApiTypes';

export function useMessageSearch() {
  const [searchResults, setSearchResults] = useState<Message[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState<Error | null>(null);

  const search = async (conversationId: string, query: string, limit = 20, offset = 0) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setSearchLoading(true);
    setSearchError(null);
    
    try {
      const results = await searchMessagesInConversation(conversationId, query, limit, offset);
      setSearchResults(results);
    } catch (err: any) {
      setSearchError(err);
      console.error('Message search failed:', err);
    } finally {
      setSearchLoading(false);
    }
  };

  const clearResults = () => {
    setSearchResults([]);
    setSearchError(null);
  };

  return {
    searchResults,
    searchLoading,
    searchError,
    search,
    clearResults
  };
}