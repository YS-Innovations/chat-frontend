// src/api/socket.ts

import { io, Socket } from 'socket.io-client';
import type { Message } from './chatService';

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
 * Must include `conversationId`, `senderId`, and `content`.
 */
export function sendMessageSocket(payload: {
  conversationId: string;
  senderId: string; // ✅ Agent or guest ID
  content: string;
}) {
  connectSocket();
  socket.emit('sendMessage', payload);
  console.log('[Dashboard] ✉️ Message sent via socket:', payload);
}

// Add these new functions to your socket.ts file

/**
 * Mark a message as read
 */
export function markMessageAsRead(messageId: string) {
  connectSocket();
  socket.emit('messageRead', { messageId });
}

/**
 * Mark multiple messages as seen
 */
export function markMessagesAsSeen(messageIds: string[]) {
  connectSocket();
  socket.emit('markMessagesAsSeen', { messageIds });
}

/**
 * Get unread messages count
 */
export function getUnreadMessages(conversationId?: string) {
  connectSocket();
  return new Promise<{ unreadMessages: Message[] }>((resolve) => {
    socket.emit('getUnreadMessages', { conversationId }, resolve);
  });
}

// Add these event listeners
socket.on('messageStatusUpdated', (data: {
  messageId: string;
  status: 'SENT' | 'DELIVERED' | 'SEEN';
  readBy?: string;
  readAt?: string;
}) => {
  // You can handle status updates here if needed
  console.log('Message status updated:', data);
});


export function markMessageAsDelivered(messageId: string) {
  connectSocket();
  socket.emit('markMessageAsDelivered', { messageId });
}


export default socket;
