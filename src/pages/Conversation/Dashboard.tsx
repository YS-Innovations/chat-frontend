import { useState, useRef, useEffect } from 'react'
import { useAgentSocket } from '@/pages/Conversation/hooks/useAgentSocket'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { v4 as uuidv4 } from 'uuid'
import AgentInbox from './components/AgentInbox'
import AgentChatWindow from './components/AgentChatWindow'

const ROLE_KEYS = ['AGENT', 'ADMIN', 'OWNER'] as const

export default function Dashboard() {
  const [role, setRole] = useState<'AGENT' | 'ADMIN' | 'OWNER'>('AGENT')

  const [selectedConversation, setSelectedConversation] = useState<{
    uuid: string
    conversationId: string
    guestName?: string
  } | null>(null)

  // ✅ Use ref to persist UUID map for each role
  const roleUUIDMap = useRef<Record<string, string>>({})

  // ✅ Initialize UUIDs only once on load
  useEffect(() => {
    ROLE_KEYS.forEach((r) => {
      const key = `uuid_${r.toLowerCase()}`
      const stored = localStorage.getItem(key)
      const uuid = stored || uuidv4()
      roleUUIDMap.current[r] = uuid
      if (!stored) localStorage.setItem(key, uuid)
    })
  }, [])

  const agentUuid = roleUUIDMap.current[role]

  const { socket, connected } = useAgentSocket({
    role,
    uuid: agentUuid,
  })

  return (
    <div className="flex h-screen w-screen bg-muted text-foreground">
      <aside className="w-80 border-r p-4 bg-background">
        <div className="flex gap-2 mb-4">
          {ROLE_KEYS.map((r) => (
            <Button
              key={r}
              variant={r === role ? 'default' : 'outline'}
              onClick={() => setRole(r)}
              className="flex-1 text-xs"
            >
              {r}
            </Button>
          ))}
        </div>

        <AgentInbox
          socket={socket}
          selectedConversationId={selectedConversation?.conversationId}
          onSelect={(uuid, conversationId, guestName) =>
            setSelectedConversation({ uuid, conversationId, guestName })
          }
        />
      </aside>

      <main className="flex-1 p-4">
        <Card className="h-full flex flex-col">
          {selectedConversation ? (
            <AgentChatWindow
              socket={socket}
              connected={connected}
              uuid={selectedConversation.uuid}
              conversationId={selectedConversation.conversationId}
              guestName={selectedConversation.guestName}
              senderRole={role}
            />
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              Select a conversation to begin
            </div>
          )}
        </Card>
      </main>
    </div>
  )
}
