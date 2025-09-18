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
  seen: boolean;
  agent?: {
    id: string;
    name: string | null;
    email: string | null;
  };
  agentId?: string | null;
   lastMessage?: {
    content: string | null;
    createdAt: string;
    senderName: string | null;
  } | null;
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
 *
 * NEW: `senderAuth0Id` is optional and may be present when the backend includes the Auth0 id
 * of the sender (useful to match the frontend auth identity against message sender).
 */
export interface Message {
  id: string;
  conversationId: string;
  senderId?: string | null;
  senderAuth0Id?: string | null;
  parentId?: string | null;
  content?: string | null;
  mediaUrl?: string | null;
  mediaType?: string | null;
  fileName?: string | null;
  createdAt: string;
  // New fields for read receipts:
  deliveredAt?: string | null;
  seenAt?: string | null;
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

/** Mark one or more messages as “DELIVERED” via REST. */
export async function markDelivered(
  payload: { conversationId?: string; messageIds?: string[]; userId?: string; deliveredAt?: string },
  token: string
): Promise<void> {
  await axios.post(`${API_BASE}/read-receipts/delivered`, payload, {
    headers: { Authorization: `Bearer ${token}` },
  });
}

/** Mark messages as “SEEN” in a conversation via REST. */
export async function markSeen(
  payload: { conversationId: string; userId?: string; uptoMessageId?: string; seenAt?: string },
  token: string
): Promise<void> {
  await axios.post(`${API_BASE}/read-receipts/seen`, payload, {
    headers: { Authorization: `Bearer ${token}` },
  });
}


export interface SearchConversationsParams {
  query?: string;
  status?: string;
  channelId?: string;
  agentId?: string;
  hasAgent?: boolean;
  startDate?: string;
  endDate?: string;
  limit?: number;
  offset?: number;
}

export interface SearchConversationsResult {
  results: ConversationListItem[];
  totalCount: number;
}

export interface MessageMatch {
  id: string;
  content: string;
  createdAt: string;
  senderName: string | null;
}

export interface SearchConversationResult extends ConversationListItem {
  messageMatches?: MessageMatch[];
}

export async function searchConversations(
  params: SearchConversationsParams,
  token: string
): Promise<SearchConversationsResult> {
  const queryParams = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      // Convert boolean values to strings
      if (typeof value === 'boolean') {
        queryParams.append(key, value.toString());
      } else {
        queryParams.append(key, value.toString());
      }
    }
  });

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