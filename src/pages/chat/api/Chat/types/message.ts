// src/types/message.ts
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

export interface FetchMessagesOptions {
  threads?: 'flat' | 'nested';
  threadPageSize?: number;
}
