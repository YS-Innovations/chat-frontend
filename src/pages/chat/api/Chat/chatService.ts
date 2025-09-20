import { fetchConversations, deleteConversation } from './service/conversationService';
import { fetchMessages, markDelivered, markSeen, searchMessagesInConversation } from './service/messageService';
import { searchConversations } from './service/searchService';

const API_BASE = import.meta.env.VITE_BACKEND_URL;
if (!API_BASE) {
  throw new Error('VITE_BACKEND_URL is not defined');
}

export { fetchConversations, fetchMessages, deleteConversation, markDelivered, markSeen, searchConversations, searchMessagesInConversation };
