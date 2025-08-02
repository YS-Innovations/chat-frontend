import { useEffect, useState, useRef } from 'react'
import { Socket } from 'socket.io-client'
import { getGuestUUID } from '@/pages/Conversation/lib/uuid'
import type { Message } from '@/pages/Conversation/types/message'

export function useConversation(socket: Socket | null) {
  const [messages, setMessages] = useState<Message[]>([])
  const [conversationId, setConversationId] = useState<string|undefined>(undefined)
  const [typing, setTyping] = useState(false)
  const [csatVisible, setCsatVisible] = useState(false)
  const [showEmailPrompt, setShowEmailPrompt] = useState(false)
  const firstMessageSent = useRef(false)
  const didRestore = useRef(false)          // ensure one‑time history fetch
  const uuid = getGuestUUID()

  // 1) On mount: restore conversationId only
  useEffect(() => {
    const saved = localStorage.getItem('coConnectGuest')
    if (!saved) return
    const { conversationId: stored } = JSON.parse(saved)
    if (stored) setConversationId(stored)
  }, [])

  // 2) Once we have conversationId (either restored or via socket), fetch history exactly once
  useEffect(() => {
    if (!conversationId || didRestore.current) return
    didRestore.current = true

    fetch(`${import.meta.env.VITE_SOCKET_URL}/conversation/${conversationId}/messages`)
      .then(async res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        return res.json()
      })
      .then(data => {
        if (Array.isArray(data)) {
          setMessages(data)
          console.log('🔁 Restored history', data)
        } else {
          console.warn('⚠️ Unexpected history payload', data)
        }
      })
      .catch(err => {
        console.error('❌ History fetch failed', err)
        setMessages([])
      })
  }, [conversationId])

  // 3) Socket handlers for real‑time updates
  useEffect(() => {
    if (!socket) return
    console.log('[💬 useConversation] init, uuid=', uuid)

    const handleNew = (msg: Message) => {
      setMessages(m => [...m, msg])

      // first time a conversationId arrives, persist it
      if (!conversationId && msg.conversationId) {
        setConversationId(msg.conversationId)
        localStorage.setItem('coConnectGuest',
          JSON.stringify({ uuid, conversationId: msg.conversationId })
        )
        console.log('🆔 Saved conversationId', msg.conversationId)
      }

      // email prompt on first guest message
      if (msg.senderRole === 'GUEST' && !firstMessageSent.current) {
        firstMessageSent.current = true
        setShowEmailPrompt(true)
      }
    }

    socket.on('message:new', handleNew)
    socket.on('typing:start', () => setTyping(true))
    socket.on('typing:stop',  () => setTyping(false))
    socket.on('conversation:resolve', () => setCsatVisible(true))

    return () => {
      socket.off('message:new', handleNew)
      socket.off('typing:start')
      socket.off('typing:stop')
      socket.off('conversation:resolve')
    }
  }, [socket, conversationId])

  // 4) Actions
  const sendMessage = (p: { content?:string; mediaUrl?:string; metadata?:any; parentId?:string }) => {
    if (!socket || (!p.content && !p.mediaUrl)) return
    console.log('[📤 guest:send_message]', { uuid, conversationId, ...p })
    socket.emit('guest:send_message', { uuid, conversationId, ...p })
  }

  const markAsRead = (messageId: string) => {
    if (!socket) return
    socket.emit('read:receipt', { uuid, messageId })
  }

  const endConversation = () => {
    const idToUse = conversationId ?? messages[0]?.conversationId
    if (socket && idToUse) socket.emit('conversation:end', { uuid, conversationId: idToUse })
    localStorage.removeItem('coConnectGuest')
    setCsatVisible(true)
  }

  const submitCSAT = (p: { uuid:string; conversationId:string; rating:number; comment?:string }) => {
    if (socket) socket.emit('csat:submit', p)
    setCsatVisible(false)
  }

  const submitEmail = (email: string) => {
    if (socket) socket.emit('guest:update_info', { uuid, email })
    setShowEmailPrompt(false)
  }

  return {
    messages,
    sendMessage,
    markAsRead,
    typing,
    csatVisible,
    endConversation,
    submitCSAT,
    showEmailPrompt,
    submitEmail,
    conversationId,
  }
}
