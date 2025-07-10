export interface Message {
  id: string
  content?: string
  mediaUrl?: string
  metadata?: {
    expiresAt?: string
    [key: string]: unknown
  }
  senderId?: string
  senderRole: 'GUEST' | 'AGENT' | 'ADMIN' | 'OWNER'
  parentId?: string
  conversationId?: string
  createdAt: string
  isRead?: boolean

  deliveredAt?: string // or Date if you're using Date objects

  // Add sender object if included in message payload from backend
  sender?: {
    id: string
    uuid: string
    name?: string
    email?: string
    Role: 'GUEST' | 'AGENT' | 'ADMIN' | 'OWNER'
  }

  // (Optional) conversation object from backend if included in payload
  conversation?: {
    id: string
    channelId?: string
    guestId?: string
    agentId?: string
  }
}
