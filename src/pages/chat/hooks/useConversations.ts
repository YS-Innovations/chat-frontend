// src/hooks/useConversations.ts
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

export function useConversations(): UseConversationsResult & { refresh: () => Promise<void> } {
  const { getAccessTokenSilently } = useAuth0();
  const [conversations, setConversations] = useState<ConversationListItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  async function load() {
    try {
      setLoading(true);
      const token = await getAccessTokenSilently();
      const data = await fetchConversations(token);
      setConversations(data);
      connectSocket();
      data.forEach((c) => joinConversation(c.id));
    } catch (err: any) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    function handleIncoming(msg: { conversationId: string; createdAt: string }) {
      setConversations((prev) => {
        const idx = prev.findIndex((c) => c.id === msg.conversationId);
        if (idx === -1) return prev;
        const updated = { ...prev[idx], updatedAt: msg.createdAt };
        return [updated, ...prev.filter((_, i) => i !== idx)];
      });
    }

    socket.on('message', handleIncoming);
    return () => {
      socket.off('message', handleIncoming);
    };
  }, []);

  return { conversations, loading, error, refresh: load };
}

