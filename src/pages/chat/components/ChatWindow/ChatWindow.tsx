import React, { useEffect, useRef, useCallback, useState } from 'react';
import { useMessages } from '../../hooks/useMessages';
import MessageBubble from './MessageBubble';
import ThreadedMessageList from './ThreadedMessageList';
import type { Message } from '../../api/chatService';
import ChatHeader from './ChatHeader';
import AgentAssignmentDialog from '../ConversationList/AgentAssignmentDialog';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import ConversationDetailsPanel from '../ConversationList/ConversationDetailsPanel';
import type { ConversationListItem } from '../../api/chatService';

interface ChatWindowProps {
  conversationId: string | null;
  selfId: string;
  conversationData?: ConversationListItem | null;
  onAgentAssignmentChange?: () => void;
  onReply?: (message: Message) => void;
}

const SCROLL_THRESHOLD_PX = 120;

const ChatWindow: React.FC<ChatWindowProps> = ({ 
  conversationId, 
  selfId, 
  conversationData,
  onAgentAssignmentChange, onReply
}) => {
  const { messages, loading, error } = useMessages(conversationId);
  const [showAgentDialog, setShowAgentDialog] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const resizeObserverRef = useRef<ResizeObserver | null>(null);

  const isNearBottom = useCallback((el: HTMLDivElement | null) => {
    if (!el) return false;
    const distance = el.scrollHeight - el.scrollTop - el.clientHeight;
    return distance < SCROLL_THRESHOLD_PX;
  }, []);

  const scrollToBottom = useCallback((smooth = true) => {
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

  useEffect(() => {
    const el = containerRef.current;
    const nearBottomBefore = isNearBottom(el);

    const raf = requestAnimationFrame(() => {
      if (!loading && nearBottomBefore) {
        scrollToBottom(true);
      }
    });

    return () => cancelAnimationFrame(raf);
  }, [messages.length, loading, isNearBottom, scrollToBottom]);

  useEffect(() => {
    if (conversationId == null) return;
    if (!loading) {
      const id = requestAnimationFrame(() => scrollToBottom(false));
      return () => cancelAnimationFrame(id);
    }
    return;
  }, [conversationId, loading, scrollToBottom]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    if ('ResizeObserver' in window) {
      resizeObserverRef.current = new ResizeObserver(() => {
        if (isNearBottom(el)) {
          scrollToBottom(false);
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

  // Detect threaded/nested shape — backend will include `replies` for nested results.
  const isThreaded = messages.some((m) => Array.isArray((m as any).replies) && (m as any).replies.length > 0);

  return (
    <>
      <div className="flex flex-col h-full">
        <ChatHeader 
          conversation={conversationData}
          onAssignAgent={() => setShowAgentDialog(true)}
          onShowDetails={() => setShowDetails(true)}
        />
        
        <div
          ref={containerRef}
          className="flex-1 px-4 py-2 overflow-y-auto space-y-2 bg-white min-h-0"
          tabIndex={0}
        >
          {isThreaded ? (
        <ThreadedMessageList messages={messages} onReply={onReply} className="pt-1" />
      ) : (
        <>
          {messages.map((msg) => (
            <MessageBubble key={msg.id} message={msg} selfId={selfId} onReply={onReply} />
          ))}
        </>
      )}
          <div ref={bottomRef} />
        </div>
      </div>

      <AgentAssignmentDialog
        open={showAgentDialog}
        onOpenChange={setShowAgentDialog}
        conversationId={conversationId}
        currentAgent={conversationData?.agent}
        onAssignmentChange={onAgentAssignmentChange}
      />

      <Sheet open={showDetails} onOpenChange={setShowDetails}>
        <SheetContent side="right">
          <SheetHeader>
            <SheetTitle>User Details</SheetTitle>
          </SheetHeader>
          {conversationId && (
            <ConversationDetailsPanel 
              conversationId={conversationId}
              conversation={conversationData}
            />
          )}
        </SheetContent>
      </Sheet>
    </>
  );
};

export default ChatWindow;