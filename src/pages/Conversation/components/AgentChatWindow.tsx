import { useEffect, useRef, useState } from 'react'
import type { Socket } from 'socket.io-client'
import type { Message } from '@/pages/Conversation/types/message'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Card } from '@/components/ui/card'
import { sanitize } from '@/pages/Conversation/lib/sanitize'
import type { Descendant } from 'slate'
import { serializeToHtml } from '@/pages/Conversation/lib/serializeToHtml'
import RichTextEditor from './RichTextEditor'

interface Props {
  socket: Socket | null
  connected: boolean
  uuid: string
  conversationId: string
  guestName?: string
  senderRole: 'AGENT' | 'ADMIN' | 'OWNER'
}

export default function AgentChatWindow({
  socket,
  connected,
  uuid,
  conversationId,
  guestName,
  senderRole,
}: Props) {
  const [messages, setMessages] = useState<Message[]>([])
  const [typing, setTyping] = useState(false)
  const seenMessageIds = useRef<Set<string>>(new Set())

  const [value, setValue] = useState<Descendant[]>([
    {
      type: 'paragraph',
      children: [{ text: '' }],
    },
  ])

  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!socket || !conversationId) return

    socket.emit('join', { conversationId }, (ack: any) => {
      console.log('✅ Dashboard joined conversation room:', ack)
    })

    const handleNewMessage = (msg: Message) => {
      if (msg.conversationId === conversationId) {
        if (seenMessageIds.current.has(msg.id)) return
        seenMessageIds.current.add(msg.id)
        setMessages(prev => [...prev, msg])
      }
    }

    const handleTypingStart = () => setTyping(true)
    const handleTypingStop = () => setTyping(false)

    socket.on('message:new', handleNewMessage)
    socket.on('typing:start', handleTypingStart)
    socket.on('typing:stop', handleTypingStop)

    return () => {
      socket.off('message:new', handleNewMessage)
      socket.off('typing:start', handleTypingStart)
      socket.off('typing:stop', handleTypingStop)
    }
  }, [socket, conversationId])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = () => {
    if (!socket) return

    const html = serializeToHtml(value)
    if (!html.trim()) return

    socket.emit('agent:send_message', {
      uuid,
      conversationId,
      content: html,
    })

    setValue([
      {
        type: 'paragraph',
        children: [{ text: '' }],
      },
    ])
  }

  const isImageFile = (url: string) =>
    /\.(jpe?g|png|gif|bmp|webp|svg)$/i.test(url)

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-3 border-b bg-muted rounded-t-md">
        <div className="text-sm font-semibold">{guestName || 'Guest'}</div>
        <div className="text-xs text-muted-foreground">
          {connected ? 'Online' : 'Offline'} | You are: {senderRole}
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map(msg => {
          const isAgent = msg.senderRole !== 'GUEST'
          const bubbleClass = isAgent
            ? 'bg-primary text-white rounded-br-none ml-auto'
            : 'bg-muted text-muted-foreground rounded-bl-none'

          const senderName = msg.sender?.name || (isAgent ? msg.senderRole : 'You')

          return (
            <div key={msg.id} className="flex flex-col max-w-[80%] space-y-1">
              <div
                className={`text-xs font-medium mb-0.5 ${isAgent ? 'text-right ml-auto' : 'text-left'}`}
              >
                {senderName}
              </div>
              <Card className={`px-3 py-2 text-sm ${bubbleClass}`}>
                {msg.mediaUrl ? (
                  isImageFile(msg.mediaUrl) ? (
                    <img
                      src={msg.mediaUrl}
                      alt="attachment"
                      className="max-w-64 max-h-48 object-contain rounded-md shadow"
                    />
                  ) : (
                    <a
                      href={msg.mediaUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 underline"
                    >
                      📎 Attachment
                    </a>
                  )
                ) : (
                  <div
                    className="prose prose-sm max-w-full prose-li:marker:text-muted-foreground prose-ol:list-decimal prose-ul:list-disc"
                    dangerouslySetInnerHTML={{ __html: sanitize(msg.content || '') }}
                  />
                )}
              </Card>
            </div>
          )
        })}

        {typing && <div className="text-xs italic text-muted-foreground">Guest is typing…</div>}
        <div ref={bottomRef} />
      </ScrollArea>

      {/* Editor */}
      <Separator />
      <div className="p-2 border-t bg-background">
        <RichTextEditor value={value} onChange={setValue} onSend={handleSend} />
      </div>
    </div>
  )
}
