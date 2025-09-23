// src/components/ChatWindow/ChatHeader.tsx
import React from 'react';
import { User, MoreVertical, Search } from 'lucide-react';
import type { ConversationListItem } from '../../api/chatService';

interface ChatHeaderProps {
  conversation: ConversationListItem | null | undefined;
  onAssignAgent?: () => void;
  onShowDetails?: () => void;
  onToggleSearch?: () => void;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({
  conversation,
  onAssignAgent,
  onShowDetails,
  onToggleSearch,
}) => {
  if (!conversation) return null;

  const agent = conversation.agent;
  const agentId = conversation.agentId;
  
  // Get channel name from settings, fallback to channel token, then channel ID
  const channelName = conversation.channel?.channelSettings?.name 
    || conversation.channel?.channelToken 
    || `Channel ${conversation.channelId?.slice(0, 8) || 'Unknown'}`;
  
  const channelType = conversation.channel?.type || 'WEB';

  return (
    <div className="flex items-center justify-between p-4 border-b bg-white">
      <div className="flex items-start gap-3">
        <div 
          className="flex items-center gap-3 cursor-pointer select-none"
          onClick={onShowDetails}
          role="button"
          aria-label="Show conversation details"
        >
          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-medium">
            {getInitials(conversation.guestName || conversation.guestId)}
          </div>
        </div>
        
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-gray-900">
              {conversation.guestName || `Guest ${conversation.guestId.slice(0, 8)}`}
            </h3>
            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
              {formatChannelType(channelType)}
            </span>
          </div>
          
          <div className="flex flex-col gap-1">
            <p className="text-sm text-gray-600">
              Channel: <span className="font-medium">{channelName}</span>
            </p>
            
            {agent && (
              <div className="flex items-center gap-1 text-sm text-blue-600">
                <User className="w-3 h-3" />
                <span>Assigned to {agent.name || agent.email || 'Agent'}</span>
              </div>
            )}

            {!agent && agentId && (
              <div className="flex items-center gap-1 text-sm text-blue-600">
                <User className="w-3 h-3" />
                <span>Assigned to agent {agentId.slice(0, 8)}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={onToggleSearch}
          className="p-2 text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
          title="Search in conversation"
        >
          <Search className="w-4 h-4" />
        </button>

        {agent || agentId ? (
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
          <MoreVertical className="w-4 h-4" onClick={onShowDetails}/>
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

function formatChannelType(channelType: string): string {
  const typeMap: Record<string, string> = {
    'WEB': 'Web',
    'WHATSAPP': 'WhatsApp'
  };
  
  return typeMap[channelType] || channelType;
}

export default ChatHeader;