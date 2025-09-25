import type { SendMessagePayload } from "../types/SocketMessageTypes";
import { SOCKET_EVENT_NAMES } from "./eventNames";
import socket, { connectSocket} from "./socket";

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
