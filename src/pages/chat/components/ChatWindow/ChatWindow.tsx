// src/components/ChatWindow/ChatWindow.tsx
import React, { useEffect, useRef, useCallback } from 'react';
import { useMessages } from '../../hooks/useMessages';
import MessageBubble from './MessageBubble';

interface ChatWindowProps {
  conversationId: string | null;
  selfId?: string;
}

const SCROLL_THRESHOLD_PX = 120;

const ChatWindow: React.FC<ChatWindowProps> = ({ conversationId, selfId }) => {
  const { messages, loading, error } = useMessages(conversationId);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const resizeObserverRef = useRef<ResizeObserver | null>(null);

  const isNearBottom = useCallback((el: HTMLDivElement | null) => {
    if (!el) return false; // important: if not mounted, don't assume near-bottom
    const distance = el.scrollHeight - el.scrollTop - el.clientHeight;
    return distance < SCROLL_THRESHOLD_PX;
  }, []);

  const scrollToBottom = useCallback((smooth = true) => {
    // prefer the sentinel
    if (bottomRef.current) {
      try {
        bottomRef.current.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto', block: 'end' });
        return;
      } catch {
        /* fall through */
      }
    }
    const el = containerRef.current;
    if (!el) return;
    if (smooth) el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
    else el.scrollTop = el.scrollHeight;
  }, []);

  // When messages change, auto-scroll only if user was near bottom before update.
  // Depend explicitly on loading, messages.length, and callbacks to avoid stale closures.
  useEffect(() => {
    const el = containerRef.current;
    const nearBottomBefore = isNearBottom(el);

    const raf = requestAnimationFrame(() => {
      // only auto-scroll when messages finished loading and user was near bottom before update
      if (!loading && nearBottomBefore) {
        scrollToBottom(true);
      }
    });

    return () => cancelAnimationFrame(raf);
  }, [messages.length, loading, isNearBottom, scrollToBottom]);

  // When conversation changes, jump to bottom after messages have loaded.
  useEffect(() => {
    // when conversation changes we usually want to jump to bottom after initial load
    // wait until loading is false (i.e. messages fetched or empty)
    if (conversationId == null) return;

    // if already loaded, jump right away
    if (!loading) {
      const id = requestAnimationFrame(() => scrollToBottom(false));
      return () => cancelAnimationFrame(id);
    }

    // otherwise wait for loading -> false (handled by messages effect above);
    // no need to do anything here when loading === true.
    return;
  }, [conversationId, loading, scrollToBottom]);

  // Optional: handle late content layout changes (images, embeds) by observing container size
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    // If browser supports ResizeObserver, watch for height changes and if user is near bottom keep it scrolled.
    if ('ResizeObserver' in window) {
      resizeObserverRef.current = new ResizeObserver(() => {
        // if user is near bottom, keep it scrolled after layout shifts
        if (isNearBottom(el)) {
          scrollToBottom(false); // instant to avoid jumpy animation during layout
        }
      });
      resizeObserverRef.current.observe(el);
    }

    return () => {
      if (resizeObserverRef.current) {
        resizeObserverRef.current.disconnect();
        resizeObserverRef.current = null;
      }
    };
  }, [isNearBottom, scrollToBottom, messages.length]);

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
      className="flex-1 px-4 py-2 overflow-y-auto space-y-2 bg-white min-h-0"
      tabIndex={0}
    >
      {messages.map((msg) => (
        <MessageBubble key={msg.id} message={msg} selfId={selfId} />
      ))}

      <div ref={bottomRef} />
    </div>
  );
};

export default ChatWindow;
