// src/components/ConversationList/ConversationList.tsx
import React, { useState, useEffect } from 'react';
import ConversationItem from './ConversationItem';
import { useConversations } from '../../hooks/useConversations';
import { deleteConversation, type ConversationListItem } from '../../api/chatService';
import { useAuth0 } from '@auth0/auth0-react';

interface ConversationListProps {
  onSelectConversation: (id: string) => void;
}


const ConversationList: React.FC<ConversationListProps> = ({ onSelectConversation }) => {
  const { conversations, loading, error, refresh } = useConversations();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const { getAccessTokenSilently } = useAuth0();

  useEffect(() => {
    if (selectedId) {
      onSelectConversation(selectedId);
    }
  }, [selectedId, onSelectConversation]);

  const handleDelete = async (id: string) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this conversation?');
    if (!confirmDelete) return;

    try {
      const token = await getAccessTokenSilently();
      await deleteConversation(id, token);
      await refresh();
      if (selectedId === id) setSelectedId(null);
    } catch (err) {
      console.error('Failed to delete conversation:', err);
      alert('Failed to delete conversation. Please try again.');
    }
  };

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
          onDelete={handleDelete}
        />
      ))}
    </div>
  );
};


export default ConversationList;
