// src/api/socket.ts

import { io, Socket } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL;
if (!SOCKET_URL) {
  throw new Error('VITE_SOCKET_URL is not defined');
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
export function connectSocket() {
  if (!socket.connected) {
    socket.connect();
  }
}

/**
 * Disconnect from WebSocket server cleanly.
 */
export function disconnectSocket() {
  if (socket.connected) {
    socket.disconnect();
  }
}

/**
 * Join a conversation room to receive/send live messages.
 * Must be called before sending or listening to messages for that conversation.
 */
export function joinConversation(conversationId: string) {
  connectSocket();
  socket.emit('joinConversation', { conversationId });
}

/**
 * Send a new message over Socket.IO.
 * Must include `conversationId`, `senderId` (string | null), and `content`.
 *
 * Note: Backend accepts `senderId` as nullable; we reflect that in the type here.
 */
export function sendMessageSocket(payload: {
  conversationId: string;
  senderId: string; // Agent or guest ID, nullable when unknown
  content: string; // sanitized HTML from client (server must re-sanitize)
  mediaUrl?: string;
}) {
  connectSocket();
  socket.emit('sendMessage', payload);
  console.log('[Dashboard] ✉️ Message sent via socket:', payload);
}

export default socket;
