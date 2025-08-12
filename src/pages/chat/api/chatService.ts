// src/api/chatService.ts

import axios from 'axios';

const API_BASE = import.meta.env.VITE_BACKEND_URL;
if (!API_BASE) {
  throw new Error('VITE_BACKEND_URL is not defined');
}

/**
 * Minimal shape of a conversation for the dashboard list.
 * Assumes your backend exposes GET /conversations (you may need to implement this).
 */
export interface ConversationListItem {
  id: string;
  guestId: string;
  channelId: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Fetch all active conversations (guest sessions).
 * You’ll need a corresponding NestJS endpoint:
 *   @Get('conversations')
 *   findAll(): Promise<ConversationRoom[]> { ... }
 */
export async function fetchConversations(): Promise<ConversationListItem[]> {
  const res = await axios.get<ConversationListItem[]>(`${API_BASE}/conversations`);
  return res.data;
}

/**
 * Shape matching your backend’s Message model.
 */
export interface Message {
  id: string;
  conversationId: string;
  senderId?: string;
  content?: string;
  mediaUrl?: string;
  createdAt: string;
  status?: 'SENT' | 'DELIVERED' | 'SEEN';
  readReceipts?: ReadReceipt[];
  isInternalNote?: boolean;
}

export interface ReadReceipt {
  userId: string;
  status: 'SENT' | 'DELIVERED' | 'SEEN';
  readAt?: string;
  user?: {
    id: string;
    name?: string;
    picture?: string;
  };
}

/**
 * Fetch the full history for one conversation.
 * Hits your existing GET /conversations/:id/messages route.
 */
export async function fetchMessages(conversationId: string): Promise<Message[]> {
  const res = await axios.get<Message[]>(
    `${API_BASE}/conversations/${encodeURIComponent(conversationId)}/messages`
  );
  return res.data;
}
