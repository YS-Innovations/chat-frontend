import React, { useEffect, useRef } from 'react';
import { useMessages } from '../../hooks/useMessages';
import MessageBubble from './MessageBubble';
import { markMessageAsDelivered, markMessagesAsSeen } from '../../api/socket';

interface ChatWindowProps {
  conversationId: string | null;
  selfId?: string;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ conversationId, selfId }) => {
  const { messages, loading, error } = useMessages(conversationId);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Mark messages as seen when they become visible

  const handleMessageVisible = (messageId: string) => {
    if (conversationId && selfId) {
      // First mark as delivered if not already
      markMessageAsDelivered(messageId);

      // Then mark as seen after a small delay (to simulate reading)
      setTimeout(() => {
        markMessagesAsSeen([messageId]);
      }, 1000);
    }
  };

  useEffect(() => {
    if (!conversationId || messages.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const messageId = entry.target.getAttribute('data-message-id');
            if (messageId) {
              handleMessageVisible(messageId);
            }
          }
        });
      },
      { threshold: 0.5 } // 50% visible
    );

    const messageElements = document.querySelectorAll('[data-message-id]');
    messageElements.forEach((el) => observer.observe(el));

    return () => {
      observer.disconnect();
    };
  }, [conversationId, messages]);


  if (!conversationId) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-500">
        Select a conversation
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-500">
        Loading messages...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center text-red-500">
        Error: {error.message}
      </div>
    );
  }

  return (
    <div className="flex-1 px-4 py-2 overflow-y-auto space-y-2 bg-white">
      {messages.map((msg) => (
        <div key={msg.id} data-message-id={msg.id}>
          <MessageBubble
            message={msg}
            selfId={selfId}
            onVisible={handleMessageVisible}
          />
        </div>
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default ChatWindow;