// src/pages/Dashboard.tsx
import React, { useState } from 'react'
import ConversationList from '../components/ConversationList/ConversationList'
import ChatWindow from '../components/ChatWindow/ChatWindow'
import RichTextEditor from '../components/MessageInput/RichTextEditor'

const Dashboard: React.FC = () => {
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null)

  return (
    // Prevent page scrolling and make the viewport a fixed-height flex container
    <div className="h-full flex overflow-hidden">
      {/* Sidebar: full height so inner list can scroll */}
      <div className="w-80 border-r bg-gray-50 h-full">
        <ConversationList onSelectConversation={setSelectedConversationId} />
      </div>

      {/* Chat area: column layout where ChatWindow grows and editor is fixed-height */}
      {/* min-h-0 is essential so children can scroll (prevents overflowing the flex column) */}
      <div className="flex-1 flex flex-col min-h-0">
        <ChatWindow conversationId={selectedConversationId} />
        <RichTextEditor conversationId={selectedConversationId} />
      </div>
    </div>
  )
}

export default Dashboard
