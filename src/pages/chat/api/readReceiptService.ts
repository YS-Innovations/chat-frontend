// src/pages/chat/api/readReceiptService.ts
import axios from 'axios';

const API_BASE = import.meta.env.VITE_BACKEND_URL;
if (!API_BASE) {
  throw new Error('VITE_BACKEND_URL is not defined');
}

// Allowed receipt status values (matches backend enum MessageStatus)
export type ReceiptStatus = 'SENT' | 'DELIVERED' | 'SEEN';

/**
 * Shape of a read receipt returned from the server.
 */
export interface ReadReceiptPayload {
  id: string;
  messageId: string;
  conversationId: string;
  userId: string;
  status: ReceiptStatus;
  createdAt: string; // ISO timestamp
  deliveredAt?: string | null;
  seenAt?: string | null;
}

/**
 * Payload for creating/upserting a read receipt.
 */
export interface CreateReadReceiptParams {
  messageId: string;
  conversationId: string;
  userId?: string;
  status?: ReceiptStatus;
  deliveredAt?: string;
  seenAt?: string;
}

/**
 * Payload for marking messages as delivered.
 * Either `messageIds` or `conversationId` must be provided.
 */
export interface MarkDeliveredParams {
  messageIds?: string[];
  conversationId?: string;
  userId?: string;
  deliveredAt?: string;
}

/**
 * Payload for marking messages as seen.
 */
export interface MarkSeenParams {
  conversationId: string;
  userId?: string;
  uptoMessageId?: string;
  seenAt?: string;
}

/**
 * Create or update a single read receipt.
 */
export async function upsertReadReceipt(params: CreateReadReceiptParams): Promise<ReadReceiptPayload> {
  const res = await axios.post<ReadReceiptPayload>(`${API_BASE}/read-receipts`, params);
  return res.data;
}

/**
 * Mark one or more messages as delivered for a user.
 */
export async function markMessagesAsDelivered(params: MarkDeliveredParams): Promise<ReadReceiptPayload[]> {
  const res = await axios.post<ReadReceiptPayload[]>(`${API_BASE}/read-receipts/delivered`, params);
  return res.data;
}

/**
 * Mark messages in a conversation as seen for a user.
 */
export async function markMessagesAsSeen(params: MarkSeenParams): Promise<ReadReceiptPayload[]> {
  const res = await axios.post<ReadReceiptPayload[]>(`${API_BASE}/read-receipts/seen`, params);
  return res.data;
}

/**
 * Fetch read receipts for a specific message.
 */
export async function getReadReceiptsByMessage(messageId: string): Promise<ReadReceiptPayload[]> {
  const res = await axios.get<ReadReceiptPayload[]>(
    `${API_BASE}/read-receipts/messages/${encodeURIComponent(messageId)}`
  );
  return res.data;
}

/**
 * Fetch read receipts for a conversation (with optional paging).
 */
export async function getReadReceiptsByConversation(
  conversationId: string,
  limit?: number,
  offset?: number
): Promise<ReadReceiptPayload[]> {
  const params: Record<string, any> = {};
  if (limit !== undefined) params.limit = limit;
  if (offset !== undefined) params.offset = offset;
  const res = await axios.get<ReadReceiptPayload[]>(
    `${API_BASE}/read-receipts/conversations/${encodeURIComponent(conversationId)}`,
    { params }
  );
  return res.data;
}
