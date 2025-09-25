// src/pages/chat/api/chatService.ts
import axios from 'axios';
import type { ConversationListItem, Message, FetchMessagesOptions, SearchConversationsParams, SearchConversationsResult } from '../types/ChatApiTypes';
import { buildQueryParams } from '../utils/Apiutils';

const API_BASE = import.meta.env.VITE_BACKEND_URL;
if (!API_BASE) {
  throw new Error('VITE_BACKEND_URL is not defined');
}

/**
 * Fetch all active conversations (guest sessions).
 */
export async function fetchConversations(token: string): Promise<ConversationListItem[]> {
  const res = await axios.get<ConversationListItem[]>(`${API_BASE}/conversations`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.data;
}

/**
 * Fetch the full history for one conversation.
 */
export async function fetchMessages(
  conversationId: string,
  options?: FetchMessagesOptions,
): Promise<Message[]> {
  const params = buildQueryParams({
    threads: options?.threads,
    threadPageSize: options?.threadPageSize,
  });

  const url = `${API_BASE}/conversations/${encodeURIComponent(conversationId)}/messages`;

  const res = await axios.get<Message[]>(url, { params });
  return res.data;
}

/**
 * Delete a conversation (requires authentication token).
 */
export async function deleteConversation(conversationId: string, token: string): Promise<void> {
  await axios.delete(`${API_BASE}/conversations/${encodeURIComponent(conversationId)}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

/**
 * Search conversations based on given parameters.
 */
export async function searchConversations(
  params: SearchConversationsParams,
  token: string
): Promise<SearchConversationsResult> {
  const queryParams = buildQueryParams(params);

  const res = await axios.get<SearchConversationsResult>(
    `${API_BASE}/conversations/search?${queryParams.toString()}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return res.data;
}

/**
 * Search messages within a specific conversation.
 */
export async function searchMessagesInConversation(
  conversationId: string,
  query: string,
  limit = 20,
  offset = 0
): Promise<Message[]> {
  const params = new URLSearchParams({
    query,
    limit: limit.toString(),
    offset: offset.toString(),
  });

  const url = `${API_BASE}/conversations/${encodeURIComponent(conversationId)}/messages/search?${params.toString()}`;

  const res = await axios.get<Message[]>(url);
  return res.data;
}
