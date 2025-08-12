import React, { useState, useEffect } from 'react';
import ConversationItem from './ConversationItem';
import { useConversations } from '../../hooks/useConversations';
import type { ConversationListItem } from '../../api/chatService';
import { getUnreadMessages } from '../../api/socket';

interface ConversationListProps {
  onSelectConversation: (id: string) => void;
}

const ConversationList: React.FC<ConversationListProps> = ({ onSelectConversation }) => {
  const { conversations, loading, error } = useConversations();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    if (selectedId) {
      onSelectConversation(selectedId);
      // Reset unread count when conversation is selected
      setUnreadCounts(prev => ({
        ...prev,
        [selectedId]: 0
      }));
    }
  }, [selectedId, onSelectConversation]);

  // Load unread counts for all conversations
  useEffect(() => {
    const fetchUnreadCounts = async () => {
      const counts: Record<string, number> = {};
      for (const conv of conversations) {
        try {
          const result = await getUnreadMessages(conv.id);
          counts[conv.id] = result.unreadMessages.length;
        } catch (err) {
          console.error('Error fetching unread messages:', err);
          counts[conv.id] = 0;
        }
      }
      setUnreadCounts(counts);
    };

    if (conversations.length > 0) {
      fetchUnreadCounts();
    }
  }, [conversations]);

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
          unreadCount={unreadCounts[conv.id] || 0}
        />
      ))}
    </div>
  );
};

export default ConversationList;