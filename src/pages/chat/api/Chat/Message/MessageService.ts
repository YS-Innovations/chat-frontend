import axios from 'axios';
import type { Message, FetchMessagesOptions} from '../../../types/ChatApiTypes';
import { buildQueryParams } from '../../../utils/Apiutils';

const API_BASE = import.meta.env.VITE_BACKEND_URL;
if (!API_BASE) {
  throw new Error('VITE_BACKEND_URL is not defined');
}

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