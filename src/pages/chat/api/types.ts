// src/pages/chat/api/types.ts

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
  channel?: {
    channelToken: string;
    type: string;
    channelSettings?: {
      name: string | null;
      domain: string | null;
    };
  };
}

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
  deliveredAt?: string | null;
  seenAt?: string | null;
  replies?: Message[];
}

export interface FetchMessagesOptions {
  threads?: 'flat' | 'nested';
  threadPageSize?: number;
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
