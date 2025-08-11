// src/components/ChatWindow/ChatWindow.tsx
import React from 'react';
import { useMessages } from '../../hooks/useMessages';
import MessageBubble from './MessageBubble';

interface ChatWindowProps {
  /** Currently selected conversation ID */
  conversationId: string | null;
  /** Optional agent user ID to highlight sent messages */
  selfId?: string;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ conversationId, selfId }) => {
  const { messages, loading, error } = useMessages(conversationId);

  if (!conversationId) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-500">
        Select a conversation
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-500">
        Loading messages...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center text-red-500">
        Error: {error.message}
      </div>
    );
  }

  return (
    <div className="flex-1 px-4 py-2 overflow-y-auto space-y-2 bg-white">
      {messages.map((msg) => (
        <MessageBubble key={msg.id} message={msg} selfId={selfId} />
      ))}
    </div>
  );
};

export default ChatWindow;