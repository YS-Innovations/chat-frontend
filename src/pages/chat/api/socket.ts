// src/api/socket.ts
import { io, Socket } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL;
if (!SOCKET_URL) {
  throw new Error('VITE_SOCKET_URL is not defined');
}

/**
 * Event names used by the frontend. Keep these aligned with the server-side
 * Socket event names in your NestJS ChatGateway/ReadReceipts modules.
 *
 * NOTE: The server-side constants may live in a shared place; if you later
 * add a shared package, prefer importing the constants from there.
 */
export const SOCKET_EVENT_NAMES = {
  CONVERSATION_JOIN: 'joinConversation',
  CONVERSATION_JOINED: 'conversationJoined',
  SEND_MESSAGE: 'sendMessage',
  MESSAGE_NEW: 'message',
  RECEIPT_DELIVERED: 'receipt:delivered',
  RECEIPT_SEEN: 'receipt:seen',
  RECEIPT_UPDATED: 'receipt:updated',
} as const;

export type SocketEventName = typeof SOCKET_EVENT_NAMES[keyof typeof SOCKET_EVENT_NAMES];

/**
 * Payload shape sent when creating a message from the client.
 * Matches server's expected SendMessagePayload:
 *   { conversationId, senderId?, content?, mediaUrl?, mediaType?, fileName?, clientMsgId?, parentId? }
 *
 * All optional fields are nullable to match how the backend accepts `null` for senderId etc.
 */
export interface SendMessagePayload {
  conversationId: string;
  senderId?: string | null;
  content?: string | null;
  mediaUrl?: string | null;
  mediaType?: string | null;
  fileName?: string | null;
  clientMsgId?: string | null;
  parentId?: string | null; // <-- new: optional parent message id for threaded replies
}

/**
 * Singleton Socket.IO client.
 * Starts disconnected; call `connectSocket()` or `joinConversation()` to open connection.
 */
const socket: Socket = io(SOCKET_URL, {
  transports: ['websocket'],
  autoConnect: false,
});

/**
 * Connect to WebSocket server if not already connected.
 */
export function connectSocket(): void {
  if (!socket.connected) {
    socket.connect();
  }
}

/**
 * Disconnect from WebSocket server cleanly.
 */
export function disconnectSocket(): void {
  if (socket.connected) {
    socket.disconnect();
  }
}

/**
 * Join a conversation room to receive/send live messages.
 * Must be called before sending or listening to messages for that conversation.
 */
export function joinConversation(conversationId: string): void {
  connectSocket();
  // emit the same event name the server expects
  socket.emit(SOCKET_EVENT_NAMES.CONVERSATION_JOIN, { conversationId });
}

/**
 * Leave a conversation room.
 */
export function leaveConversation(conversationId: string): void {
  if (!socket.connected) return;
  socket.emit('leaveConversation', { conversationId });
}

/**
 * Send a new message over Socket.IO.
 * Includes optional `parentId` for threaded replies.
 *
 * NOTE:
 * - This function is intentionally permissive in typings (allows nullable fields)
 *   to match the backend handler which accepts nullable senderId and optional media.
 */
export function sendMessageSocket(payload: SendMessagePayload): void {
  try {
    connectSocket();
    socket.emit(SOCKET_EVENT_NAMES.SEND_MESSAGE, payload);
    // lightweight debug log — remove or guard behind env var in production if noisy
    // (kept here intentionally to help during development)
    // eslint-disable-next-line no-console
    console.log('[Socket] emit sendMessage', payload);
  } catch (err) {
    // Surface any immediate client-side errors, but do not throw (non-fatal)
    // eslint-disable-next-line no-console
    console.error('[Socket] failed to send message:', err);
  }
}

export default socket;
