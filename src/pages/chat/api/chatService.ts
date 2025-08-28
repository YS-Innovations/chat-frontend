// src/pages/chat/api/chatService.ts
import axios from 'axios';

const API_BASE = import.meta.env.VITE_BACKEND_URL;
if (!API_BASE) {
  throw new Error('VITE_BACKEND_URL is not defined');
}

/**
 * Minimal shape of a conversation for the dashboard list.
 * Assumes your backend exposes GET /conversations.
 */
export interface ConversationListItem {
  id: string;
  guestId: string;
  guestName: string;
  channelId: string;
  createdAt: string;
  updatedAt: string;
  currentStatus: string;
  seen: boolean; // Add this
  agent?: {
    id: string;
    name: string | null;
    email: string | null;
  };
  agentId?: string | null;
}

/**
 * Fetch all active conversations (guest sessions).
 * You’ll need a corresponding NestJS endpoint:
 *   @Get('conversations')
 *   findAll(): Promise<ConversationRoom[]> { ... }
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
 * Message shape used across the frontend.
 *
 * Notes:
 * - `parentId` is optional and present when this message is a reply.
 * - `replies` is optional and present when the backend returns threaded (nested) results.
 * - `mediaUrl`, `mediaType`, and `fileName` are populated by the backend by extracting them
 *   from the message.metadata field (see MessagesService.extractMediaFields).
 *
 * This type intentionally matches the enriched MessageWithMedia used by your NestJS backend.
 */
export interface Message {
  id: string;
  conversationId: string;
  senderId?: string | null;
  parentId?: string | null;
  content?: string | null;
  mediaUrl?: string | null;
  mediaType?: string | null;
  fileName?: string | null;
  createdAt: string;
  // When fetching threaded/nested view the backend returns replies for each root message.
  // replies are the same Message shape (recursive).
  replies?: Message[];
}

/**
 * Options for fetching messages.
 * - threads: 'flat' (default) or 'nested' to request threaded view from the backend.
 * - threadPageSize: when requesting 'nested' the backend will limit replies per parent by this value.
 */
export interface FetchMessagesOptions {
  threads?: 'flat' | 'nested';
  threadPageSize?: number;
}

/**
 * Fetch the full history for one conversation.
 *
 * - By default this requests the flat view (same as GET /conversations/:id/messages).
 * - To request the backend's nested/threaded view call with { threads: 'nested' }.
 *
 * Example:
 *   fetchMessages(convId, { threads: 'nested', threadPageSize: 50 })
 *
 * Returns an array of Message. When requesting nested threads the root messages
 * will include `.replies?: Message[]`.
 */
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


export interface ConversationListItem {
  id: string;
  guestId: string;
  guestName: string;
  channelId: string;
  createdAt: string;
  updatedAt: string;
  currentStatus: string;
  seen: boolean; // Add this property
  agent?: {
    id: string;
    name: string | null;
    email: string | null;
  };
  agentId?: string | null;
}