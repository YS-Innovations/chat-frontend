// src/components/ChatWindow/ThreadedMessageList.tsx
import React from 'react';
import MessageBubble from './MessageBubble';
import type { Message } from '@/pages/chat/types/ChatApiTypes';

interface ThreadedMessageListProps {
  messages: Message[];
  onReply?: (message: Message) => void;
  depth?: number;
  maxDepth?: number;
  className?: string;
  selfId: string;
  searchTerm?: string;
}

const ThreadedMessageList: React.FC<ThreadedMessageListProps> = ({
  messages,
  onReply,
  depth = 0,
  maxDepth,
  className,
  selfId,
  searchTerm = ''

}) => {
  if (!messages || messages.length === 0) {
    return null;
  }
  const INDENT_PX = 16;
  const leftOffset = Math.min(depth, (typeof maxDepth === 'number' ? maxDepth : Infinity)) * INDENT_PX;

  return (
    <ul
      role="list"
      className={className ?? 'space-y-2'}
      aria-label={depth === 0 ? 'Messages' : undefined}
    >
      {messages.map((msg) => (
        <li key={msg.id} role="listitem" className="relative">
          <div
            // left indentation and subtle left border to indicate thread
            style={{ marginLeft: leftOffset }}
            className="pl-3"
          >
            <div className="relative">
              {/* Left connecting line for replies (only show when depth > 0 or children exist) */}
              {depth >= 0 && (
                <div
                  aria-hidden
                  style={{
                    position: 'absolute',
                    left: -INDENT_PX + 6, // tweak to align with bubble padding
                    top: 8,
                    bottom: 0,
                    width: 1,
                    backgroundColor: 'transparent',
                  }}
                />
              )}

              {/* Render the message bubble and wire up the onReply callback */}
              <MessageBubble
                message={msg}
                onReply={onReply}
                selfId={selfId}
                searchTerm={searchTerm}
              />
            </div>

            {/* Render replies recursively (if any) */}
            {Array.isArray(msg.replies) && msg.replies.length > 0 && (
              <div className="mt-2">
                <ThreadedMessageList
                  messages={msg.replies}
                  onReply={onReply}
                  depth={depth + 1}
                  maxDepth={maxDepth}
                  selfId={selfId}
                />
              </div>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
};

export default ThreadedMessageList;
