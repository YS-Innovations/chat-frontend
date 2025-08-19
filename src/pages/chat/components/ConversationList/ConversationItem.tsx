// src/components/ConversationList/ConversationItem.tsx
import React from 'react';
import type { ConversationListItem } from '../../api/chatService';

interface ConversationItemProps {
  conversation: ConversationListItem;
  selected: boolean;
  onSelect: (id: string) => void;
}

const ConversationItem: React.FC<ConversationItemProps> = ({ conversation, selected, onSelect }) => {
  const { id, guestId, updatedAt } = conversation;
  const formattedTime = new Date(updatedAt).toLocaleString();

  return (
    <div
      onClick={() => onSelect(id)}
      className={`cursor-pointer px-4 py-2 flex flex-col space-y-1 rounded-lg transition \
        ${selected ? 'bg-blue-100' : 'hover:bg-gray-100'}`}
    >
      <span className="font-medium text-gray-800">{guestId}</span>
      <span className="text-xs text-gray-500">Last updated: {formattedTime}</span>
    </div>
  );
};
export default ConversationItem;