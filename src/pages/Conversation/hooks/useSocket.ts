import { useEffect, useState } from 'react'
import { Socket } from 'socket.io-client'
import { getGuestUUID } from '@/pages/Conversation/lib/uuid'
import { initSocket } from '@/pages/Conversation/lib/socket'
import { toast } from 'sonner'

export function useSocket() {
  const [socket, setSocket] = useState<Socket | null>(null)
  const [connected, setConnected] = useState(false)
  const [guestConnected, setGuestConnected] = useState(false)

  useEffect(() => {
    const uuid = getGuestUUID()
    const queryParamToken = new URLSearchParams(window.location.search).get('channelToken')
    const storedToken = localStorage.getItem('channelToken')
    let channelToken: string = queryParamToken ?? storedToken ?? ''

    console.log('👉 uuid:', uuid)
    console.log('👉 Initial channelToken:', channelToken)

    const connect = async () => {
      // 🔄 Fetch channelToken if not available
      if (!channelToken) {
        try {
          const res = await fetch(`${import.meta.env.VITE_SOCKET_URL}/channels/create-random`, {
            method: 'POST',
          })
          const data = await res.json()
          channelToken = data.channelToken
          localStorage.setItem('channelToken', channelToken)
          console.log('🆕 New channelToken fetched:', channelToken)
        } catch (err) {
          console.error('❌ Failed to fetch channelToken', err)
          return
        }
      }

      const newSocket = initSocket(channelToken, uuid)

      // 🔌 On connect
      newSocket.on('connect', () => {
        console.log('[✅ SOCKET CONNECTED]', newSocket.id)

        // ⚠️ Re-identify guest on reconnect
        newSocket.emit('guest:connect', { uuid, channelToken })
        console.log('[📤 Sent guest:connect]', { uuid, channelToken })

        toast("Connected", {
          description: 'You’re back online.',
        })

        setConnected(true)
      })

      // 🔌 On guest confirmed
      newSocket.on('guest:connected', (payload) => {
        console.log('[✅ guest:connected]', payload)
        console.log('👉 channelToken (confirmed):', channelToken)

        if (payload.conversationId) {
          console.log('🗨️ Active conversationId:', payload.conversationId)

          localStorage.setItem(
            'coConnectGuest',
            JSON.stringify({
              uuid,
              conversationId: payload.conversationId,
            })
          )
          console.log('💾 Saved conversationId to localStorage:', payload.conversationId)
        }

        setGuestConnected(true)
      })

      // ❌ On disconnect
      newSocket.on('disconnect', () => {
        console.warn('[❌ SOCKET DISCONNECTED]')
        setConnected(false)
        setGuestConnected(false)

        toast("Reconnecting...", {
          description: 'Trying to reconnect to support...',
        })
      })

      // ⚠️ Rate limit
      newSocket.on('rate:limit_warning', (payload) => {
        toast("Slow down", {
          description: payload.message,
        })
      })

      // 🚨 Token expired handler (optional)
      newSocket.on('token:expired', async () => {
        console.warn('[⏳ Token expired] Refreshing...')
        try {
          const res = await fetch(`${import.meta.env.VITE_SOCKET_URL}/channels/create-random`, {
            method: 'POST',
          })
          const data = await res.json()
          const newToken = data.channelToken
          localStorage.setItem('channelToken', newToken)

          // Reconnect with new token
          newSocket.io.opts.query = {
            uuid,
            channelToken: newToken,
          }
          newSocket.connect()
          console.log('🔁 Reconnected with new channelToken:', newToken)
        } catch (err) {
          console.error('❌ Token refresh failed', err)
        }
      })

      setSocket(newSocket)
    }

    connect()

    return () => {
      if (socket) {
        console.log('[🔌 Cleaning up socket]')
        socket.disconnect()
        socket.removeAllListeners()
      }
    }
  }, [])

  return { socket, connected, guestConnected }
}
