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
  CONVERSATION_JOIN: 'conversation:join',
  CONVERSATION_JOINED: 'conversation:joined',
  SEND_MESSAGE: 'sendMessage',
  MESSAGE_NEW: 'message:new',
  RECEIPT_DELIVERED: 'receipt:delivered',
  RECEIPT_SEEN: 'receipt:seen',
  RECEIPT_UPDATED: 'receipt:updated',
  TYPING: 'typing',
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
  parentId?: string | null; // optional parent message id for threaded replies
}

/**
 * Payload for delivery receipts emitted by the client.
 * Matches backend expectation for `receipt:delivered`.
 */
export interface DeliveredReceiptPayload {
  conversationId?: string;
  messageIds?: string[]; // IDs of messages that were delivered
  deliveredAt?: string; // ISO timestamp
}

/**
 * Payload for seen receipts emitted by the client.
 * Matches backend expectation for `receipt:seen`.
 */
export interface SeenReceiptPayload {
  conversationId: string;
  uptoMessageId?: string; // mark messages up to (and including) this id as seen
  seenAt?: string; // ISO timestamp
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
    // eslint-disable-next-line no-console
    console.log('[Socket] emit sendMessage', payload);
  } catch (err) {
    // Surface any immediate client-side errors, but do not throw (non-fatal)
    // eslint-disable-next-line no-console
    console.error('[Socket] failed to send message:', err);
  }
}

/**
 * Emit a delivery receipt over Socket.IO.
 * Components/hooks can call this when messages have been delivered to the device
 * (e.g., when they are received by the client but not yet opened/seen).
 */
export function sendDeliveredReceipt(payload: DeliveredReceiptPayload): void {
  try {
    connectSocket();
    socket.emit(SOCKET_EVENT_NAMES.RECEIPT_DELIVERED, payload);
    // eslint-disable-next-line no-console
    console.log('[Socket] emit receipt:delivered', payload);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('[Socket] failed to send delivered receipt:', err);
  }
}

/**
 * Emit a seen receipt over Socket.IO.
 * Call this when the user has viewed/read messages in a conversation.
 */
export function sendSeenReceipt(payload: SeenReceiptPayload): void {
  try {
    connectSocket();
    socket.emit(SOCKET_EVENT_NAMES.RECEIPT_SEEN, payload);
    // eslint-disable-next-line no-console
    console.log('[Socket] emit receipt:seen', payload);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('[Socket] failed to send seen receipt:', err);
  }
}

/**
 * Emit typing status for a conversation. Debounce at call sites.
 */
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
