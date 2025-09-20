// src/pages/chat/api/conversationService.ts
import axios from 'axios';
import { type ConversationListItem } from '../types/conversation';

const API_BASE = import.meta.env.VITE_BACKEND_URL;

export async function fetchConversations(token: string): Promise<ConversationListItem[]> {
  const res = await axios.get<ConversationListItem[]>(`${API_BASE}/conversations`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.data;
}

export async function deleteConversation(conversationId: string, token: string): Promise<void> {
  await axios.delete(`${API_BASE}/conversations/${encodeURIComponent(conversationId)}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}
