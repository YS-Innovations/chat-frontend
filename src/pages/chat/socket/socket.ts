// src/api/socket.ts
import { io, Socket } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL;
if (!SOCKET_URL) {
  throw new Error('VITE_SOCKET_URL is not defined');
}

export const SOCKET_EVENT_NAMES = {
  CONVERSATION_JOIN: 'conversation:join',
  CONVERSATION_JOINED: 'conversation:joined',
  SEND_MESSAGE: 'sendMessage',
  MESSAGE_NEW: 'message:new',
  TYPING: 'typing',
} as const;

export type SocketEventName = typeof SOCKET_EVENT_NAMES[keyof typeof SOCKET_EVENT_NAMES];

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

const socket: Socket = io(SOCKET_URL, {
  transports: ['websocket'],
  autoConnect: false,
});

export function connectSocket(): void {
  if (!socket.connected) {
    socket.connect();
  }
}

export function disconnectSocket(): void {
  if (socket.connected) {
    socket.disconnect();
  }
}

export function joinConversation(conversationId: string): void {
  connectSocket();
  // emit the same event name the server expects
  socket.emit(SOCKET_EVENT_NAMES.CONVERSATION_JOIN, { conversationId });
}

export function leaveConversation(conversationId: string): void {
  if (!socket.connected) return;
  socket.emit('leaveConversation', { conversationId });
}

export function sendMessageSocket(payload: SendMessagePayload): void {
  try {
    connectSocket();
    socket.emit(SOCKET_EVENT_NAMES.SEND_MESSAGE, payload);
    // lightweight debug log — remove or guard behind env var in production if noisy
    // eslint-disable-next-line no-console
    console.log('[Socket] emit sendMessage', payload);
  } catch (err) {
    // Surface any immediate client-side errors, but do not throw (non-fatal)
    // eslint-disable-next-line no-console
    console.error('[Socket] failed to send message:', err);
  }
}

export function emitTyping(conversationId: string, isTyping: boolean, userId?: string | null): void {
  try {
    connectSocket();
    socket.emit(SOCKET_EVENT_NAMES.TYPING, { conversationId, isTyping, userId: userId ?? undefined });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('[Socket] failed to emit typing:', err);
  }
}

export default socket;
