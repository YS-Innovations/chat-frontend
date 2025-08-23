import React from 'react';
import { User, MoreVertical } from 'lucide-react';
import type { ConversationListItem } from '../../api/chatService';

interface ChatHeaderProps {
  conversation: ConversationListItem | null | undefined;
  onAssignAgent?: () => void;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({ conversation, onAssignAgent }) => {
  if (!conversation) return null;

  return (
    <div className="flex items-center justify-between p-4 border-b bg-white">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-medium">
          {getInitials(conversation.guestName || conversation.guestId)}
        </div>
        
        <div>
          <h3 className="font-semibold text-gray-900">
            {conversation.guestName || `Guest ${conversation.guestId.slice(0, 8)}`}
          </h3>
          
          {conversation.agent && (
            <div className="flex items-center gap-1 text-sm text-blue-600">
              <User className="w-3 h-3" />
              <span>Assigned to {conversation.agent.name || conversation.agent.email}</span>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2">
        {conversation.agent ? (
          <button
            onClick={onAssignAgent}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
            title="Reassign agent"
          >
            <User className="w-4 h-4" />
          </button>
        ) : (
          <button
            onClick={onAssignAgent}
            className="px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Assign Agent
          </button>
        )}
        
        <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-md transition-colors">
          <MoreVertical className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

function getInitials(name: string): string {
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export default ChatHeader;