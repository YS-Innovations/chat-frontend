// src/pages/chat/hooks/useConversations.ts
import { useState, useEffect } from 'react';
import socket, { connectSocket, joinConversation } from '../api/socket';
import { fetchConversations } from '../api/chatService';
import type { ConversationListItem } from '../api/chatService';
import { useAuth0 } from '@auth0/auth0-react';

export interface UseConversationsResult {
  conversations: ConversationListItem[];
  loading: boolean;
  error: Error | null;
}

export function useConversations(channelId?: string): UseConversationsResult & { refresh: () => Promise<void> } {
  const { getAccessTokenSilently } = useAuth0();
  const [conversations, setConversations] = useState<ConversationListItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  async function load() {
    try {
      setLoading(true);
      const token = await getAccessTokenSilently();
      const data = await fetchConversations(token);
      
      // Filter conversations by channel if channelId is provided
      const filteredData = channelId 
        ? data.filter(conv => conv.channelId === channelId)
        : data;
      
      setConversations(filteredData);
      connectSocket();
      filteredData.forEach((c) => joinConversation(c.id));
    } catch (err: any) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [channelId]); // Reload when channelId changes

  useEffect(() => {
    function handleIncoming(msg: { conversationId: string; createdAt: string; channelId?: string }) {
      setConversations((prev) => {
        // If we're filtering by channel, only add messages for that channel
        if (channelId && msg.channelId !== channelId) {
          return prev;
        }
        
        const idx = prev.findIndex((c) => c.id === msg.conversationId);
        if (idx === -1) {
          // New conversation - fetch updated list
          load();
          return prev;
        }
        
        const updated = { ...prev[idx], updatedAt: msg.createdAt };
        return [updated, ...prev.filter((_, i) => i !== idx)];
      });
    }

    socket.on('message', handleIncoming);
    return () => {
      socket.off('message', handleIncoming);
    };
  }, [channelId]);

  return { conversations, loading, error, refresh: load };
}