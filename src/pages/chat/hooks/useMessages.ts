// src/hooks/useMessages.ts
import { useState, useEffect } from 'react'
import socket, { joinConversation } from '../api/socket'
import { fetchMessages } from '../api/chatService'
import type { Message as ApiMessage } from '../api/chatService'

export interface UseMessagesResult {
  messages: ApiMessage[]
  loading: boolean
  error: Error | null
}

export function useMessages(
  conversationId: string | null
): UseMessagesResult {
  const [messages, setMessages] = useState<ApiMessage[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<Error | null>(null)

  // Join room & load history whenever conversationId changes
  useEffect(() => {
    if (!conversationId) {
      // clear state if deselected
      setMessages([])
      setLoading(false)
      setError(null)
      return
    }

    let isMounted = true
    const id = conversationId

    // Reset state
    setLoading(true)
    setError(null)
    setMessages([])

    // conversationId is now non-null
    joinConversation(id)

    async function loadHistory() {
      try {
        const history = await fetchMessages(id)
        if (isMounted) setMessages(history)
      } catch (err: any) {
        if (isMounted) setError(err)
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    loadHistory()
    return () => {
      isMounted = false
    }
  }, [conversationId])

  // Listen for new messages and dedupe
  useEffect(() => {
    if (!conversationId) return
    const id = conversationId

    function handleNew(msg: ApiMessage) {
      if (msg.conversationId !== id) return
      setMessages(prev => {
        // Skip if this message is already present
        if (prev.some(m => m.id === msg.id)) return prev
        return [...prev, msg]
      })
    }

    socket.on('message', handleNew)
    return () => {
      socket.off('message', handleNew)
    }
  }, [conversationId])

  return { messages, loading, error }
}
