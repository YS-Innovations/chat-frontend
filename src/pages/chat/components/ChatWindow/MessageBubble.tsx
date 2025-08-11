// src/components/ChatWindow/MessageBubble.tsx
import React from 'react';
import type { Message } from '../../api/chatService';

interface MessageBubbleProps {
  message: Message;
  /**
   * Optional ID of the current agent user to differentiate bubbles.
   */
  selfId?: string;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message, selfId }) => {
  const isMe = message.senderId === selfId;
  const time = new Date(message.createdAt).toLocaleTimeString();

  return (
    <div
      className={`max-w-xs px-3 py-2 rounded-2xl text-sm flex flex-col space-y-1
        ${
          isMe
            ? 'bg-blue-100 ml-auto items-end text-right'
            : 'bg-gray-200 mr-auto items-start text-left'
        }`}
    >
      <span>{message.content || ''}</span>
      <span className="text-xs text-gray-500">{time}</span>
    </div>
  );
};

export default MessageBubble;