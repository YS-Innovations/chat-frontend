// src/hooks/useMessages.ts
import { useState, useEffect } from 'react';
import socket, { joinConversation } from '../api/socket';
import { fetchMessages } from '../api/chatService';
import type { Message as ApiMessage, ReadReceipt } from '../api/chatService';

export interface UseMessagesResult {
  messages: ApiMessage[];
  loading: boolean;
  error: Error | null;
}

export function useMessages(
  conversationId: string | null
): UseMessagesResult {
  const [messages, setMessages] = useState<ApiMessage[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!conversationId) {
      setMessages([]);
      setLoading(false);
      setError(null);
      return;
    }

    let isMounted = true;
    const id = conversationId;

    setLoading(true);
    setError(null);
    setMessages([]);

    joinConversation(id);

    async function loadHistory() {
      try {
        const history = await fetchMessages(id);
        if (isMounted) {
          const enhancedMessages = history.map(msg => ({
            ...msg,
            status: calculateMessageStatus(msg.readReceipts)
          }));
          setMessages(enhancedMessages);
        }
      } catch (err: any) {
        if (isMounted) setError(err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadHistory();
    return () => {
      isMounted = false;
    };
  }, [conversationId]);

function calculateMessageStatus(
  receipts?: ReadReceipt[], 
  selfId?: string
): 'SENT' | 'DELIVERED' | 'SEEN' {
  if (!receipts || receipts.length === 0) return 'SENT';
  
  // For messages sent by me, find the highest status among recipients
  if (receipts.some(r => r.userId === selfId)) {
    if (receipts.some(r => r.status === 'SEEN' && r.userId !== selfId)) return 'SEEN';
    if (receipts.some(r => r.status === 'DELIVERED' && r.userId !== selfId)) return 'DELIVERED';
    return 'SENT';
  }
  
  // For messages sent by others, find my receipt status
  const myReceipt = receipts.find(r => r.userId === selfId);
  return myReceipt?.status || 'SENT';
}
  useEffect(() => {
    if (!conversationId) return;
    const id = conversationId;

    function handleNewMessage(msg: ApiMessage) {
      if (msg.conversationId !== id) return;
      
      setMessages(prev => {
        if (prev.some(m => m.id === msg.id)) return prev;
        
        return [...prev, {
          ...msg,
          status: calculateMessageStatus(msg.readReceipts)
        }];
      });
    }

    function handleStatusUpdate(data: {
      messageId: string;
      status: 'SENT' | 'DELIVERED' | 'SEEN';
      readBy?: string;
      readAt?: string;
    }) {
      setMessages(prev => prev.map(msg => {
        if (msg.id !== data.messageId) return msg;

        // Create updated read receipt if needed
        let updatedReceipts = msg.readReceipts;
        if (data.status === 'SEEN' && data.readBy) {
          updatedReceipts = updateOrAddReceipt(
            msg.readReceipts,
            data.readBy,
            data.status,
            data.readAt
          );
        }

        return {
          ...msg,
          status: data.status,
          readReceipts: updatedReceipts
        };
      }));
    }

    socket.on('message', handleNewMessage);
    socket.on('messageStatusUpdated', handleStatusUpdate);

    return () => {
      socket.off('message', handleNewMessage);
      socket.off('messageStatusUpdated', handleStatusUpdate);
    };
  }, [conversationId]);

  return { messages, loading, error };
}

function updateOrAddReceipt(
  receipts: ReadReceipt[] | undefined,
  userId: string,
  status: 'SENT' | 'DELIVERED' | 'SEEN',
  readAt?: string
): ReadReceipt[] {
  if (!receipts) return [createReceipt(userId, status, readAt)];
  
  const existingIndex = receipts.findIndex(r => r.userId === userId);
  if (existingIndex >= 0) {
    return receipts.map((r, i) => 
      i === existingIndex 
        ? { ...r, status, readAt: status === 'SEEN' ? readAt : r.readAt }
        : r
    );
  }
  
  return [...receipts, createReceipt(userId, status, readAt)];
}

function createReceipt(
  userId: string,
  status: 'SENT' | 'DELIVERED' | 'SEEN',
  readAt?: string
): ReadReceipt {
  return {
    userId,
    status,
    ...(status === 'SEEN' && readAt ? { readAt } : {}),
    user: undefined
  };
}