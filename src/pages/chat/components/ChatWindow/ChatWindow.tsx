// src/components/ChatWindow/ChatWindow.tsx
import React, { useEffect, useRef, useCallback } from 'react';
import { useMessages } from '../../hooks/useMessages';
import MessageBubble from './MessageBubble';

interface ChatWindowProps {
  /** Currently selected conversation ID */
  conversationId: string | null;
  /** Optional agent user ID to highlight sent messages */
  selfId?: string;
}

const SCROLL_THRESHOLD_PX = 120; // if within this from bottom, auto-scroll on new message

const ChatWindow: React.FC<ChatWindowProps> = ({ conversationId, selfId }) => {
  const { messages, loading, error } = useMessages(conversationId);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  // helper to check if user is near bottom already
  const isNearBottom = useCallback((el: HTMLDivElement | null) => {
    if (!el) return true;
    const distance = el.scrollHeight - el.scrollTop - el.clientHeight;
    return distance < SCROLL_THRESHOLD_PX;
  }, []);

  // scroll to bottom nicely
  const scrollToBottom = useCallback((smooth = true) => {
    // prefer scrolling the sentinel into view (works even when using virtualized lists)
    if (bottomRef.current) {
      try {
        bottomRef.current.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto', block: 'end' });
        return;
      } catch {
        /* fall through */
      }
    }
    // fallback: set container scrollTop
    const el = containerRef.current;
    if (!el) return;
    if (smooth) {
      el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
    } else {
      el.scrollTop = el.scrollHeight;
    }
  }, []);

  // When messages change, auto-scroll only if user was near bottom before update.
  useEffect(() => {
    const el = containerRef.current;
    const nearBottomBefore = isNearBottom(el);

    // Wait a tick for the DOM to render new messages, then scroll if appropriate
    // RequestAnimationFrame is more reliable than setTimeout(,0) for layout
    const raf = requestAnimationFrame(() => {
      // If conversation just loaded (loading false) — we want to jump to bottom
      if (!loading && nearBottomBefore) {
        scrollToBottom(true);
      } else if (!loading && messages.length && nearBottomBefore) {
        scrollToBottom(true);
      }
      // If user was not near bottom, do nothing (preserve their scroll position)
    });

    return () => cancelAnimationFrame(raf);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages.length]);

  // When conversation changes, jump to bottom after load
  useEffect(() => {
    // jump (not smooth) to bottom when the conversation changes or when there are no messages yet
    const id = requestAnimationFrame(() => scrollToBottom(false));
    return () => cancelAnimationFrame(id);
  }, [conversationId, scrollToBottom]);

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
    <div
      ref={containerRef}
      className="flex-1 px-4 py-2 overflow-y-auto space-y-2 bg-white"
      // optional: keyboard focus handling so Home/End behave predictably
      tabIndex={0}
    >
      {messages.map((msg) => (
        <MessageBubble key={msg.id} message={msg} selfId={selfId} />
      ))}

      {/* sentinel element we scroll into view to reach bottom */}
      <div ref={bottomRef} />
    </div>
  );
};

export default ChatWindow;
