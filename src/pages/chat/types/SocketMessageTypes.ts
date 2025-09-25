export interface SendMessagePayload {
  conversationId: string;
  senderId?: string | null;
  content?: string | null;
  mediaUrl?: string | null;
  mediaType?: string | null;
  fileName?: string | null;
  clientMsgId?: string | null;
  parentId?: string | null; 
}