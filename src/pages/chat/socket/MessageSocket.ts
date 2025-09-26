import type { SendMessagePayload } from "../types/SocketMessageTypes";
import { SOCKET_EVENT_NAMES } from "./eventNames";
import socket, { connectSocket } from "./socket";

export function sendMessageSocket(payload: SendMessagePayload): void {
  try {
    connectSocket();
    socket.emit(SOCKET_EVENT_NAMES.SEND_MESSAGE, payload);
    console.log('[Socket] emit sendMessage', payload);
  } catch (err) {
    console.error('[Socket] failed to send message:', err);
  }
}