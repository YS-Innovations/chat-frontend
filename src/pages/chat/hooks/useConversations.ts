// src/pages/chat/hooks/useConversations.ts
import { useState, useEffect, useCallback } from 'react';
import socket, { connectSocket, joinConversation, disconnectSocket } from '../api/socket';
import { fetchConversations } from '../api/Chat/chatService';
import type { ConversationListItem } from '../api/Chat/chatService';
import { useAuthShared } from '@/hooks/useAuthShared';

export interface UseConversationsResult {
  conversations: ConversationListItem[];
  loading: boolean;
  error: Error | null;
  hasMore: boolean;
}

export function useConversations(channelId?: string, page = 1, limit = 50): UseConversationsResult & { 
  refresh: () => Promise<void>;
  loadMore: () => void;
  reset: () => void;
} {
  const { getAccessTokenSilently } = useAuthShared();
  const [conversations, setConversations] = useState<ConversationListItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [currentPage, setCurrentPage] = useState<number>(page);

 const load = useCallback(async (pageNum: number = 1, append: boolean = false) => {
    try {
      setLoading(true);
      const token = await getAccessTokenSilently();
      const data = await fetchConversations(token);
      
      // Filter conversations by channel if channelId is provided
      const filteredData = channelId 
        ? data.filter(conv => conv.channelId === channelId)
        : data;

      // Ensure agent data is properly included
      const conversationsWithAgent = filteredData.map(conv => ({
        ...conv,
        agent: conv.agent || undefined, // Ensure agent is either object or undefined
        agentId: conv.agent?.id || null // Ensure agentId is properly set
      }));
      
      // Simple pagination
      const startIndex = (pageNum - 1) * limit;
      const paginatedData = conversationsWithAgent.slice(0, startIndex + limit);
      
      setConversations(prev => append ? [...prev, ...paginatedData] : paginatedData);
      setHasMore(paginatedData.length < filteredData.length);
      
      // Connect to socket and join conversations
      connectSocket();
      filteredData.forEach((c) => joinConversation(c.id));
    } catch (err: any) {
      setError(err);
      console.error('Failed to load conversations:', err);
    } finally {
      setLoading(false);
    }
  }, [channelId, limit, getAccessTokenSilently]);

  const refresh = useCallback(async () => {
    await load(1, false);
    setCurrentPage(1);
  }, [load]);

  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      const nextPage = currentPage + 1;
      setCurrentPage(nextPage);
      load(nextPage, true);
    }
  }, [loading, hasMore, currentPage, load]);

  const reset = useCallback(() => {
    setConversations([]);
    setCurrentPage(1);
    setHasMore(true);
    refresh();
  }, [refresh]);

  useEffect(() => {
    refresh();
  }, [channelId, refresh]);

  useEffect(() => {
    function handleIncoming(msg: { 
      conversationId: string; 
      createdAt: string; 
      channelId?: string;
      type?: string;
    }) {
      // Only process messages for the current channel filter
      if (channelId && msg.channelId !== channelId) {
        return;
      }

      setConversations(prev => {
        const existingIndex = prev.findIndex(c => c.id === msg.conversationId);
        
        if (existingIndex >= 0) {
          // Update existing conversation timestamp
          const updatedConversations = [...prev];
          updatedConversations[existingIndex] = {
            ...updatedConversations[existingIndex],
            updatedAt: msg.createdAt
          };
          // Move to top
          const [movedItem] = updatedConversations.splice(existingIndex, 1);
          return [movedItem, ...updatedConversations];
        } else if (msg.type === 'new_conversation') {
          // New conversation - refresh the list
          refresh();
        }
        
        return prev;
      });
    }

    socket.on('message', handleIncoming);
    socket.on('new_conversation', handleIncoming);

    return () => {
      socket.off('message', handleIncoming);
      socket.off('new_conversation', handleIncoming);
      disconnectSocket();
    };
  }, [channelId, refresh]);

  return { conversations, loading, error, hasMore, refresh, loadMore, reset };
}