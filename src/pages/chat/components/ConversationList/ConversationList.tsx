// src/components/ConversationList/ConversationList.tsx
import React, { useState, useEffect } from 'react';
import ConversationItem from './ConversationItem';
import { useConversations } from '../../hooks/useConversations';
import type { ConversationListItem } from '../../api/chatService';

interface ConversationListProps {
  onSelectConversation: (id: string) => void;
}

const ConversationList: React.FC<ConversationListProps> = ({ onSelectConversation }) => {
  const { conversations, loading, error } = useConversations();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    if (selectedId) {
      onSelectConversation(selectedId);
    }
  }, [selectedId, onSelectConversation]);

  if (loading) {
    return <div className="p-4 text-center text-gray-500">Loading conversations...</div>;
  }

  if (error) {
    return <div className="p-4 text-center text-red-500">Error: {error.message}</div>;
  }

  return (
    <div className="h-full overflow-y-auto space-y-2 p-2 bg-white">
      {conversations.map((conv: ConversationListItem) => (
        <ConversationItem
          key={conv.id}
          conversation={conv}
          selected={conv.id === selectedId}
          onSelect={(id) => setSelectedId(id)}
        />
      ))}
    </div>
  );
};

export default ConversationList;
