import axios from 'axios';
import type { ConversationListItem, SearchConversationsParams, SearchConversationsResult } from '../../../types/ChatApiTypes';
import { buildQueryParams } from '../../../utils/Apiutils';

const API_BASE = import.meta.env.VITE_BACKEND_URL;
if (!API_BASE) {
  throw new Error('VITE_BACKEND_URL is not defined');
}

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
