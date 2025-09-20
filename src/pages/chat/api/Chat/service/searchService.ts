// src/pages/chat/api/searchService.ts
import axios from 'axios';
import type { SearchConversationsParams, SearchConversationsResult } from '../types/search';

const API_BASE = import.meta.env.VITE_BACKEND_URL;

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
