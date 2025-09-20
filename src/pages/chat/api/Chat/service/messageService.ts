// src/pages/chat/api/messageService.ts
import axios from 'axios';
import type { Message, FetchMessagesOptions } from '../types/message';

const API_BASE = import.meta.env.VITE_BACKEND_URL;

export async function fetchMessages(
  conversationId: string,
  options?: FetchMessagesOptions,
): Promise<Message[]> {
  const params: Record<string, string | number> = {};

  if (options?.threads) {
    params['threads'] = options.threads;
  }
  if (options?.threadPageSize && Number.isFinite(options.threadPageSize)) {
    params['threadPageSize'] = options.threadPageSize;
  }

  const url = `${API_BASE}/conversations/${encodeURIComponent(conversationId)}/messages`;

  const res = await axios.get<Message[]>(url, { params });
  return res.data;
}

export async function markDelivered(
  payload: { conversationId?: string; messageIds?: string[]; userId?: string; deliveredAt?: string },
  token: string
): Promise<void> {
  await axios.post(`${API_BASE}/read-receipts/delivered`, payload, {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function markSeen(
  payload: { conversationId: string; userId?: string; uptoMessageId?: string; seenAt?: string },
  token: string
): Promise<void> {
  await axios.post(`${API_BASE}/read-receipts/seen`, payload, {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function searchMessagesInConversation(
  conversationId: string,
  query: string,
  limit = 20,
  offset = 0
): Promise<Message[]> {
  const params = new URLSearchParams({
    query,
    limit: limit.toString(), // Convert to string for URL params
    offset: offset.toString() // Convert to string for URL params
  });

  const url = `${API_BASE}/conversations/${encodeURIComponent(conversationId)}/messages/search?${params.toString()}`;
  
  const res = await axios.get<Message[]>(url);
  return res.data;
}
