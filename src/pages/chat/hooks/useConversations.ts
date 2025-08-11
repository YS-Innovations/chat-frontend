// src/hooks/useConversations.ts
import { useState, useEffect } from 'react';
import socket, { connectSocket, joinConversation } from '../api/socket';
import { fetchConversations } from '../api/chatService';
import type { ConversationListItem } from '../api/chatService';

export interface UseConversationsResult {
  conversations: ConversationListItem[];
  loading: boolean;
  error: Error | null;
}

/**
 * Hook to load all conversations and keep them up-to-date
 * with incoming messages via WebSocket.
 */
export function useConversations(): UseConversationsResult {
  const [conversations, setConversations] = useState<ConversationListItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  // Initial load of list + join rooms
  useEffect(() => {
    let isMounted = true;

    async function load() {
      try {
        setLoading(true);
        const data = await fetchConversations();
        if (isMounted) {
          setConversations(data);
          connectSocket();
          // Join each room so we receive incoming messages
          data.forEach((c) => joinConversation(c.id));
        }
      } catch (err: any) {
        if (isMounted) setError(err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    load();
    return () => {
      isMounted = false;
    };
  }, []);

  // Reorder on incoming message
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

  return { conversations, loading, error };
}
