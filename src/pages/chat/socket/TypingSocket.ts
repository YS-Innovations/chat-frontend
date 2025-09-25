import { SOCKET_EVENT_NAMES } from "./eventNames";
import socket, { connectSocket } from "./socket";

export function emitTyping(conversationId: string, isTyping: boolean, userId?: string | null): void {
  try {
    connectSocket();
    socket.emit(SOCKET_EVENT_NAMES.TYPING, { conversationId, isTyping, userId: userId ?? undefined });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('[Socket] failed to emit typing:', err);
  }
}
