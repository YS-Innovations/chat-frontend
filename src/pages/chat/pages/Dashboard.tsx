// src/pages/Dashboard.tsx
import React, { useState } from 'react'
import ConversationList from '../components/ConversationList/ConversationList'
import ChatWindow from '../components/ChatWindow/ChatWindow'
import RichTextEditor from '../components/MessageInput/RichTextEditor'

const Dashboard: React.FC = () => {
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null)

  // === IMPORTANT ===
  // Use your real agent ID here (from auth/session). For development, use a constant.
  // This id must match the senderId you send in sendMessageSocket(...) for messages to be recognized as "mine".
  const AGENT_ID = 'agent-123' // ← replace with real agent id (or get from auth context)

  return (
    <div className="h-screen flex">
      {/* Sidebar */}
      <div className="w-80 border-r bg-gray-50">
        <ConversationList onSelectConversation={setSelectedConversationId} />
      </div>

      {/* Chat area */}
      <div className="flex-1 flex flex-col">
        {/* pass selfId down to ChatWindow so bubbles can tell which are "mine" */}
        <ChatWindow conversationId={selectedConversationId} selfId={AGENT_ID} />
        {/* pass same selfId to the editor so outgoing messages use the same senderId */}
        <RichTextEditor conversationId={selectedConversationId} selfId={AGENT_ID} />
      </div>
    </div>
  )
}

export default Dashboard
