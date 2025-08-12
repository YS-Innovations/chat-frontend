// src/components/ChatWindow/MessageBubble.tsx
import React from 'react';
import type { Message } from '../../api/chatService';
import { sanitize } from '../../utils/sanitize';

interface MessageBubbleProps {
  message: Message;
  selfId?: string;
}

/** Small double-check icon (two strokes) */
const DoubleCheckIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 24 24" className={className} aria-hidden>
    <path
      d="M1 14l4 4 7-7"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      opacity="0.95"
    />
    <path
      d="M9 14l4 4 7-7"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      opacity="0.95"
    />
  </svg>
);

const MessageBubble: React.FC<MessageBubbleProps> = ({ message, selfId }) => {
  const isMe = message.senderId === selfId;
  const time = new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  // debug logs (remove in production)
  // eslint-disable-next-line no-console
  console.log('[MessageBubble] raw message.content:', message.content);
  const safeHtml = message.content ? sanitize(message.content) : '';
  // eslint-disable-next-line no-console
  console.log('[MessageBubble] after sanitize:', safeHtml);

  const wrapperClass = `w-full flex ${isMe ? 'justify-end' : 'justify-start'} px-3 py-1`;

  return (
    <div className={wrapperClass}>
      <div className={`${isMe ? 'chat-bubble-outgoing' : 'chat-bubble-incoming'} shadow-sm`}>
        <div
          className="chat-bubble-content"
          style={{ textAlign: isMe ? 'right' : 'left', margin: 0 }}
          dangerouslySetInnerHTML={{ __html: safeHtml || '<span>(empty)</span>' }}
        />

        <div className="chat-bubble-time" aria-hidden>
          <span className="chat-bubble-time-text">{time}</span>
          {isMe && (
            <span className="chat-bubble-status" title="Sent / Delivered">
              <DoubleCheckIcon />
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;
