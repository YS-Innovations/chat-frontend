import React from 'react';
import type { ConversationListItem } from '../../api/chatService';

interface ConversationItemProps {
  conversation: ConversationListItem;
  selected: boolean;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
}

const ConversationItem: React.FC<ConversationItemProps> = ({ conversation, selected, onSelect, onDelete }) => {
  const { id, guestId, updatedAt } = conversation;
  const formattedTime = new Date(updatedAt).toLocaleString();

  return (
    <div
      className={`group relative cursor-pointer px-4 py-2 flex flex-col space-y-1 rounded-lg transition 
        ${selected ? 'bg-blue-100' : 'hover:bg-gray-100'}`}
    >
      <div onClick={() => onSelect(id)}>
        <span className="font-medium text-gray-800">{guestId}</span>
        <span className="text-xs text-gray-500 block">Last updated: {formattedTime}</span>
      </div>

      <button
        className="absolute top-1 right-2 text-red-500 text-xs opacity-0 group-hover:opacity-100"
        onClick={(e) => {
          e.stopPropagation(); // prevent triggering onSelect
          onDelete(id);
        }}
      >
        Delete
      </button>
    </div>
  );
};

export default ConversationItem;
