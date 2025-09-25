// src/hooks/useReadReceipts.ts
import { useState, useEffect } from 'react';
import socket, { SOCKET_EVENT_NAMES, joinConversation, leaveConversation } from '../socket/socket';
import type {
  ReadReceiptPayload,
  MarkDeliveredParams,
  MarkSeenParams,
} from '../api/readReceiptService';

import {
  getReadReceiptsByConversation,
  markMessagesAsDelivered,
  markMessagesAsSeen,
} from '../api/readReceiptService';

export interface UseReadReceiptsResult {
  receipts: ReadReceiptPayload[];
  loading: boolean;
  error: Error | null;
  markDelivered: (params: MarkDeliveredParams) => Promise<ReadReceiptPayload[]>;
  markSeen: (params: MarkSeenParams) => Promise<ReadReceiptPayload[]>;
}

/**
 * Hook: useReadReceipts
 *
 * - Loads read-receipt history for a conversation.
 * - Joins the socket conversation room and listens for receipt updates.
 * - Provides methods to mark messages as delivered or seen.
 */
export function useReadReceipts(conversationId: string | null): UseReadReceiptsResult {
  const [receipts, setReceipts] = useState<ReadReceiptPayload[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!conversationId) {
      setReceipts([]);
      return;
    }
    setLoading(true);
    setError(null);

    // Fetch existing receipts for the conversation
    getReadReceiptsByConversation(conversationId)
      .then(setReceipts)
      .catch(err => setError(err as Error))
      .finally(() => setLoading(false));

    // Join the socket room for live updates
    joinConversation(conversationId);
    const handleReceipts = (payload: ReadReceiptPayload[]) => {
      // Filter updates to this conversation
      const updated = payload.filter(r => r.conversationId === conversationId);
      if (updated.length === 0) return;
      setReceipts(prev => {
        const existing = new Map(prev.map(r => [r.id, r]));
        updated.forEach(r => existing.set(r.id, r));
        return Array.from(existing.values());
      });
    };
    socket.on(SOCKET_EVENT_NAMES.RECEIPT_UPDATED, handleReceipts);

    return () => {
      socket.off(SOCKET_EVENT_NAMES.RECEIPT_UPDATED, handleReceipts);
      leaveConversation(conversationId);
    };
  }, [conversationId]);

  // Function to mark messages as delivered and update state
  const markDelivered = async (params: MarkDeliveredParams) => {
    const updated = await markMessagesAsDelivered(params);
    setReceipts(prev => {
      const existing = new Map(prev.map(r => [r.id, r]));
      updated.forEach(r => existing.set(r.id, r));
      return Array.from(existing.values());
    });
    return updated;
  };

  // Function to mark messages as seen and update state
  const markSeen = async (params: MarkSeenParams) => {
    const updated = await markMessagesAsSeen(params);
    setReceipts(prev => {
      const existing = new Map(prev.map(r => [r.id, r]));
      updated.forEach(r => existing.set(r.id, r));
      return Array.from(existing.values());
    });
    return updated;
  };

  return { receipts, loading, error, markDelivered, markSeen };
}
