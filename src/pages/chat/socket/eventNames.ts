// src/api/eventNames.ts
export const SOCKET_EVENT_NAMES = {
  CONVERSATION_JOIN: 'conversation:join',
  CONVERSATION_JOINED: 'conversation:joined',
  SEND_MESSAGE: 'sendMessage',
  MESSAGE_NEW: 'message:new',
  TYPING: 'typing',
} as const;

export type SocketEventName = typeof SOCKET_EVENT_NAMES[keyof typeof SOCKET_EVENT_NAMES];
