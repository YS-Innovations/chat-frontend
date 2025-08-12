import React from 'react';
import type { ConversationListItem } from '../../api/chatService';

interface ConversationItemProps {
  conversation: ConversationListItem;
  selected: boolean;
  onSelect: (id: string) => void;
  unreadCount?: number;
}

const ConversationItem: React.FC<ConversationItemProps> = ({ 
  conversation, 
  selected, 
  onSelect,
  unreadCount 
}) => {
  const { id, guestId, updatedAt } = conversation;
  const formattedTime = new Date(updatedAt).toLocaleString();

  return (
    <div
      onClick={() => onSelect(id)}
      className={`cursor-pointer px-4 py-2 flex flex-col space-y-1 rounded-lg transition relative \
        ${selected ? 'bg-blue-100' : 'hover:bg-gray-100'}`}
    >
      <span className="font-medium text-gray-800">Guest: {guestId}</span>
      <span className="text-xs text-gray-500">Last updated: {formattedTime}</span>
      {unreadCount && unreadCount > 0 && (
        <span className="absolute right-2 top-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
          {unreadCount}
        </span>
      )}
    </div>
  );
};

export default ConversationItem;