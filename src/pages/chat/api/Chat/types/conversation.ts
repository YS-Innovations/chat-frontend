// src/types/conversation.ts
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
}
