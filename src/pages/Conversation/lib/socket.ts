import { io, Socket } from 'socket.io-client'

let socket: Socket | null = null

export function initSocket(channelToken: string, uuid: string): Socket {
  if (!socket) {
    socket = io(import.meta.env.VITE_SOCKET_URL as string, {
      transports: ['websocket'],
      query: {
        channelToken,
        uuid,
      },
    })
  }
  return socket
}

export function getSocket(): Socket {
  if (!socket) {
    throw new Error('Socket not initialized. Call initSocket() first.')
  }
  return socket
}
