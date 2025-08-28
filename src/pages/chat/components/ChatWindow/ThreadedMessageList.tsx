// src/components/ChatWindow/ThreadedMessageList.tsx
import React from 'react';
import type { Message } from '@/pages/chat/api/chatService';
import MessageBubble from './MessageBubble';

interface ThreadedMessageListProps {
  /**
   * Root list of messages to render. Each message may optionally include
   * `replies?: Message[]` returned by the backend when requesting threaded/nested view.
   */
  messages: Message[];

  /**
   * Called when user clicks the reply button inside a MessageBubble.
   * The full message object is passed.
   */
  onReply?: (message: Message) => void;

  /**
   * Starting nesting depth (internal). Consumers usually omit this.
   */
  depth?: number;

  /**
   * Optional maximum recursion depth. When reached replies will still render
   * but further indentation is capped. Default: unlimited.
   */
  maxDepth?: number;

  /**
   * Optional className forwarded to the outer container.
   */
  className?: string;
}

/**
 * ThreadedMessageList
 *
 * Recursive renderer for threaded/nested messages. For each message it renders:
 *   - MessageBubble (the main bubble UI)
 *   - Replies (indented under the bubble), recursively
 *
 * Visual style:
 * - Replies are indented using `marginLeft` calculated from depth.
 * - Each reply group has a subtle left border to visually connect threads.
 *
 * Accessibility:
 * - Uses role="list" / role="listitem" to communicate structure to assistive tech.
 *
 * Usage:
 * - Provide messages that either come from fetchMessages(..., { threads: 'nested' })
 *   or are assembled into a nested tree where each message.replies?: Message[].
 */
const ThreadedMessageList: React.FC<ThreadedMessageListProps> = ({
  messages,
  onReply,
  depth = 0,
  maxDepth,
  className,
}) => {
  if (!messages || messages.length === 0) {
    return null;
  }

  // Calculate indentation in px per depth level.
  // 16px per level is a sensible default; you can adjust if your design system differs.
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
                selfId=''
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
