// src/types/search.ts
import {type ConversationListItem } from './conversation';

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
