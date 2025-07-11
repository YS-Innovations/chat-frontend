import { useEffect, useState } from 'react'
import { io, Socket } from 'socket.io-client'

interface AgentSocketOptions {
  role: 'AGENT' | 'ADMIN' | 'OWNER'
  uuid: string
}

export function useAgentSocket({ role, uuid }: AgentSocketOptions) {
  const [socket, setSocket] = useState<Socket | null>(null)
  const [connected, setConnected] = useState(false)

  useEffect(() => {
    const s = io(import.meta.env.VITE_SOCKET_URL, {
      query: { role, uuid },
    })

    s.on('connect', () => {
      console.debug(`[Socket] Connected as ${role} (${uuid})`)
      setConnected(true)
    })

    s.on('disconnect', () => {
      console.warn(`[Socket] Disconnected`)
      setConnected(false)
    })

    setSocket(s)

    return () => {
      s.disconnect()
    }
  }, [role, uuid])

  return { socket, connected }
}
