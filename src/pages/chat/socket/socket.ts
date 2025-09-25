// src/api/socket.ts
import { io, Socket } from 'socket.io-client';
import { joinConversation, leaveConversation } from './ConversationSocket';
import { sendMessageSocket } from './MessageSocket';
import { emitTyping } from './TypingSocket';
import { SOCKET_EVENT_NAMES } from './eventNames';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL;
if (!SOCKET_URL) {
  throw new Error('VITE_SOCKET_URL is not defined');
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

export{
  joinConversation,
  leaveConversation,
  sendMessageSocket,
  emitTyping,
  SOCKET_EVENT_NAMES
}

export default socket;
