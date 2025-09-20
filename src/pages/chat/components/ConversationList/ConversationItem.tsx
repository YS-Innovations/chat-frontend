// src/pages/chat/components/ConversationList/ConversationItem.tsx
import React, { useState } from 'react';
import { MoreVertical, Trash2, Clock, User, UserX, Users, MessageSquare } from 'lucide-react';
import type { ConversationListItem, MessageMatch } from '../../api/Chat/chatService';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { useAgentAssignment } from '../../hooks/useAgentAssignment';
import AgentAssignmentDialog from './AgentAssignmentDialog';
import { Highlight } from '../Search/Highlight';
import { sanitize } from '../../utils/sanitize';

interface ConversationItemProps {
  conversation: ConversationListItem;
  selected: boolean;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  onAgentAssignmentChange?: () => void;
  searchMatches?: MessageMatch[];
  searchTerm?: string;
}

const ConversationItem: React.FC<ConversationItemProps> = ({
  conversation,
  selected,
  onSelect,
  onDelete,
  onAgentAssignmentChange,
  searchMatches = [],
  searchTerm = ''
}) => {
  const { id, guestId, updatedAt, guestName, agent, lastMessage } = conversation;
  const [showAgentDialog, setShowAgentDialog] = useState(false);
  const { unassignAgent } = useAgentAssignment();
  const truncateMessage = (content: string | null, maxLength: number = 50) => {
    if (!content) return '';
    return content.length > maxLength
      ? content.substring(0, maxLength) + '...'
      : content;
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 48) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleUnassignAgent = async () => {
    try {
      await unassignAgent(id);
      onAgentAssignmentChange?.();
    } catch (error) {
      console.error('Failed to unassign agent:', error);
    }
  };

  return (
    <>
      <div
        className={`group relative p-3 border-b cursor-pointer transition-all duration-200
          ${selected
            ? 'bg-blue-50 border-blue-200'
            : 'hover:bg-gray-50 border-gray-100'
          }`}
        onClick={() => onSelect(id)}
      >
        <div className="flex items-start gap-3">
          {/* Avatar */}
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-medium text-sm">
            {getInitials(guestName || guestId)}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <h4 className="font-medium text-gray-900 truncate">
                <Highlight text={guestName || `Guest ${guestId.slice(0, 8)}`} searchTerm={searchTerm} />
              </h4>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                {formatTime(updatedAt)}
              </div>
            </div>

            {lastMessage && (
              <div className="text-sm text-gray-600 truncate">
                {/* {lastMessage.senderName && (
                  <span className="font-medium text-gray-800">
                    {lastMessage.senderName}:{' '}
                  </span>
                )} */}
                <div
                  dangerouslySetInnerHTML={{
                    __html: sanitize(lastMessage.content || '')
                  }}
                  className="line-clamp-2"
                />
              </div>
            )}

            {/* No messages yet */}
            {!lastMessage && (
              <div className="text-sm text-gray-500 italic">
                No messages yet
              </div>
            )}

            {/* Agent Assignment Info */}
            {agent && (
              <div className="flex items-center gap-1 mt-1 text-xs text-blue-600">
                <User className="h-3 w-3" />
                <span className="truncate">
                  Assigned to <Highlight text={agent.name || agent.email || 'Assigned agent'} searchTerm={searchTerm} />
                </span>
              </div>
            )}

            {/* Message Matches */}
            {/* {searchMatches.length > 0 && (
              <div className="mt-2 space-y-1">
                {searchMatches.slice(0, 2).map((match) => (
                  <div key={match.id} className="flex items-start gap-1 text-xs text-green-600 bg-green-50 p-1 rounded">
                    <MessageSquare className="h-3 w-3 mt-0.5 flex-shrink-0" />
                    <span className="flex-1">
                      <Highlight text={match.content} searchTerm={searchTerm} />
                    </span>
                  </div>
                ))}
                {searchMatches.length > 2 && (
                  <div className="text-xs text-muted-foreground">
                    +{searchMatches.length - 2} more matches
                  </div>
                )}
              </div>
            )} */}
          </div>

          {/* Actions */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-gray-200 rounded"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreVertical className="h-4 w-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={(e) => {
                e.stopPropagation();
                setShowAgentDialog(true);
              }}>
                <Users className="h-4 w-4 mr-2" />
                {agent ? 'Reassign Agent' : 'Assign Agent'}
              </DropdownMenuItem>

              {agent && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-orange-600 focus:text-orange-600"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleUnassignAgent();
                    }}
                  >
                    <UserX className="h-4 w-4 mr-2" />
                    Unassign Agent
                  </DropdownMenuItem>
                </>
              )}

              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-red-600 focus:text-red-600"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(id);
                }}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Conversation
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Online indicator */}
        <div className={`absolute bottom-10 left-10 w-3 h-3 rounded-full ${selected ? 'bg-blue-500' : agent ? 'bg-green-500' : 'bg-gray-400'
          }`} />
      </div>

      <AgentAssignmentDialog
        open={showAgentDialog}
        onOpenChange={setShowAgentDialog}
        conversationId={id}
        currentAgent={agent}
        onAssignmentChange={onAgentAssignmentChange}
      />
    </>
  );
};

export default ConversationItem;