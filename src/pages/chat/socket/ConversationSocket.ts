import { SOCKET_EVENT_NAMES } from './eventNames';
import socket, { connectSocket } from './socket';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL;
if (!SOCKET_URL) {
  throw new Error('VITE_SOCKET_URL is not defined');
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