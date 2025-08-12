import React from 'react';
import type { Message } from '../../api/chatService';

interface MessageBubbleProps {
  message: Message;
  selfId?: string;
  onVisible?: (messageId: string) => void;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message, selfId, onVisible }) => {
  const isMe = message.senderId === selfId;
  const time = new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  
  // Status only makes sense for messages I sent
  const status = isMe ? (message.status || 'SENT') : undefined;

  React.useEffect(() => {
    // Only mark as seen if it's not my message and not already seen
    if (!isMe && onVisible) {
      onVisible(message.id);
    }
  }, [isMe, message.id, onVisible]);

  const getStatusIndicator = () => {
    if (!isMe) return null;
    
    switch(status) {
      case 'SEEN':
        return <span className="text-xs text-gray-500">✓✓ Seen</span>;
      case 'DELIVERED':
        return <span className="text-xs text-gray-500">✓✓</span>;
      case 'SENT':
        return <span className="text-xs text-gray-500">✓</span>;
      default:
        return null;
    }
  };

  return (
    <div className={`max-w-xs px-3 py-2 rounded-2xl text-sm flex flex-col space-y-1
      ${
        isMe
          ? 'bg-blue-100 ml-auto items-end text-right'
          : 'bg-gray-200 mr-auto items-start text-left'
      }`}
    >
      <span>{message.content || ''}</span>
      <div className="flex items-center space-x-1">
        <span className="text-xs text-gray-500">{time}</span>
        {getStatusIndicator()}
      </div>
    </div>
  );
};

export default MessageBubble;