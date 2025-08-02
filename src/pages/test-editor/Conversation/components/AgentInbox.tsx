import { useEffect, useState, useMemo } from 'react'
import type { Socket } from 'socket.io-client'
import type { Message } from '@/pages/Conversation/types/message'
import { cn } from '@/pages/Conversation/lib/utils'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Card } from '@/components/ui/card'
import sanitize from 'sanitize-html'

interface Props {
  socket: Socket | null
  selectedConversationId?: string
  onSelect: (uuid: string, conversationId: string, guestName?: string) => void
}

export default function AgentInbox({ socket, selectedConversationId, onSelect }: Props) {
  const [messages, setMessages] = useState<Message[]>([])

  useEffect(() => {
    if (!socket) return

    const handleNewMessage = (msg: Message) => {
      setMessages(prev => [...prev, msg])
    }

    socket.on('message:new', handleNewMessage)

    return () => {
      socket.off('message:new', handleNewMessage)
    }
  }, [socket])

  const conversations = useMemo(() => {
    const grouped: Record<string, Message> = {}

    for (const msg of messages) {
      if (!grouped[msg.conversationId!]) {
        grouped[msg.conversationId!] = msg
      } else if (
        new Date(msg.createdAt).getTime() >
        new Date(grouped[msg.conversationId!].createdAt).getTime()
      ) {
        grouped[msg.conversationId!] = msg
      }
    }

    return Object.values(grouped).sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
  }, [messages])

  return (
    <ScrollArea className="h-[calc(100vh-100px)] pr-2">
      <div className="space-y-2">
        {conversations.length === 0 && (
          <p className="text-muted-foreground text-sm text-center py-12">
            No conversations yet
          </p>
        )}

        {conversations.map((msg) => {
          const guestName =
            msg.sender?.name || msg.sender?.email || `Guest #${msg.sender?.uuid?.slice(0, 6)}`

          return (
            <Card
              key={msg.conversationId}
              onClick={() =>
                onSelect(msg.sender?.uuid!, msg.conversationId!, guestName)
              }
              className={cn(
                'p-3 cursor-pointer transition-all hover:bg-muted',
                selectedConversationId === msg.conversationId && 'bg-muted'
              )}
            >
              <div className="font-medium text-sm truncate">{guestName}</div>
              <div className="text-xs text-muted-foreground truncate mt-1">
                {msg.content
                  ? <div dangerouslySetInnerHTML={{ __html: sanitize(msg.content || '') }}></div>
                  : msg.mediaUrl
                    ? '📎 Attachment'
                    : '[no content]'}
              </div>
            </Card>
          )
        })}
      </div>
    </ScrollArea>
  )
}
