// src/pages/Dashboard.tsx
import React, { useState } from 'react'
import ConversationList from '../components/ConversationList/ConversationList'
import ChatWindow from '../components/ChatWindow/ChatWindow'
import RichTextEditor from '../components/MessageInput/RichTextEditor'

const Dashboard: React.FC = () => {
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null)

  return (
    <div className="h-screen flex">
      {/* Sidebar */}
      <div className="w-80 border-r bg-gray-50">
        <ConversationList onSelectConversation={setSelectedConversationId} />
      </div>

      {/* Chat area */}
      <div className="flex-1 flex flex-col">
        <ChatWindow conversationId={selectedConversationId} />
        <RichTextEditor conversationId={selectedConversationId} />
      </div>
    </div>
  )
}

export default Dashboard
