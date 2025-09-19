// src/components/ChatWindow/ChatWindow.tsx
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
import { sendDeliveredReceipt, sendSeenReceipt } from '../../api/socket';
import { useMessageSearch } from '../../hooks/useMessageSearch';
import ChatSearchBar from './ChatSearchBar';

interface ChatWindowProps {
  conversationId: string | null;
  selfId: string;
  conversationData?: ConversationListItem | null;
  onAgentAssignmentChange?: () => void;
  onReply?: (message: Message) => void;
  highlightMessageId?: string | null;
}

const SCROLL_THRESHOLD_PX = 120;

const ChatWindow: React.FC<ChatWindowProps> = ({
  conversationId,
  selfId,
  conversationData,
  onAgentAssignmentChange,
  onReply,
  highlightMessageId
}) => {
  const { messages, loading, error } = useMessages(conversationId);
  const [showAgentDialog, setShowAgentDialog] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const highlightedMessageRef = useRef<string | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const resizeObserverRef = useRef<ResizeObserver | null>(null);

  // Refs to avoid re-sending same receipts repeatedly
  const lastSeenUptoRef = useRef<string | null>(null);
  const lastDeliveredSetRef = useRef<Set<string>>(new Set());
  const { searchResults, search, clearResults } = useMessageSearch();
  const [searchQuery, setSearchQuery] = useState('');
  const [currentSearchMatchIndex, setCurrentSearchMatchIndex] = useState(-1);
  const searchMatchRefs = useRef<Map<string, HTMLElement>>(new Map());
  const [showSearchBar, setShowSearchBar] = useState(false);


  const conversationSearchResults = searchResults.filter(msg =>
    msg.conversationId === conversationId
  );

  // Function to scroll to a search result
  const scrollToSearchResult = useCallback((index: number) => {
    if (conversationSearchResults.length === 0 || index < 0 || index >= conversationSearchResults.length) {
      return;
    }

    const messageId = conversationSearchResults[index].id;
    const element = searchMatchRefs.current.get(messageId);

    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });

      // Highlight the message
      element.style.backgroundColor = 'rgba(255, 215, 0, 0.3)';
      element.style.transition = 'background-color 700ms ease';

      setTimeout(() => {
        if (element) {
          element.style.backgroundColor = '';
          setTimeout(() => {
            if (element) {
              element.style.transition = '';
            }
          }, 300);
        }
      }, 2000);
    }
  }, [conversationSearchResults]);

  // Handle search query changes
  useEffect(() => {
    if (conversationId && searchQuery.trim()) {
      const handler = setTimeout(() => {
        search(conversationId, searchQuery);
      }, 500);

      return () => clearTimeout(handler);
    } else {
      clearResults();
      setCurrentSearchMatchIndex(-1);
    }
  }, [searchQuery, conversationId]);

  // Navigate through search results
  const handleNextSearchMatch = () => {
    const nextIndex = (currentSearchMatchIndex + 1) % conversationSearchResults.length;
    setCurrentSearchMatchIndex(nextIndex);
    scrollToSearchResult(nextIndex);
  };

  const handlePreviousSearchMatch = () => {
    const prevIndex = currentSearchMatchIndex === 0
      ? conversationSearchResults.length - 1
      : currentSearchMatchIndex - 1;
    setCurrentSearchMatchIndex(prevIndex);
    scrollToSearchResult(prevIndex);
  };

  const handleCloseSearch = () => {
    setSearchQuery('');
    clearResults();
    setCurrentSearchMatchIndex(-1);
  };

  // Register refs for search result messages
  useEffect(() => {
    searchMatchRefs.current.clear();
    conversationSearchResults.forEach(msg => {
      const element = document.querySelector(`[data-message-id="${msg.id}"]`) as HTMLElement;
      if (element) {
        searchMatchRefs.current.set(msg.id, element);
      }
    });
  }, [conversationSearchResults]);

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

  // When messages change (and after initial load), request marking delivered/seen via socket.
  useEffect(() => {
    if (!conversationId) return;
    if (loading) return;

    try {
      // 1) Mark delivered for messages in this convo that are from others and not yet delivered
      const toDeliver = messages
        .filter((m) => {
          // Only mark messages not sent by us
          const sentByOther = !((m.senderAuth0Id && m.senderAuth0Id === selfId) || m.senderId === selfId);
          const notDelivered = !m.deliveredAt;
          return sentByOther && notDelivered;
        })
        .map((m) => m.id)
        // filter out ids we've already sent delivered for
        .filter((id) => !lastDeliveredSetRef.current.has(id));

      if (toDeliver.length > 0) {
        // Emit delivered event (server will upsert and broadcast)
        sendDeliveredReceipt({ conversationId, messageIds: toDeliver });
        // record them to avoid re-sending repeatedly
        toDeliver.forEach((id) => lastDeliveredSetRef.current.add(id));
      }

      // 2) Mark seen up to the latest message from others that hasn't been seen yet
      // find the newest message (last in array) where sender != self and seenAt is falsy
      const lastUnreadFromOther = [...messages]
        .reverse()
        .find((m) => {
          const sentByOther = !((m.senderAuth0Id && m.senderAuth0Id === selfId) || m.senderId === selfId);
          return sentByOther && !m.seenAt;
        });

      if (lastUnreadFromOther) {
        const uptoId = lastUnreadFromOther.id;
        if (lastSeenUptoRef.current !== uptoId) {
          // send seen receipt up to this message id
          sendSeenReceipt({ conversationId, uptoMessageId: uptoId });
          lastSeenUptoRef.current = uptoId;
        }
      }
    } catch (err) {
      // keep UI stable on errors
      // eslint-disable-next-line no-console
      console.error('Failed to send read receipts:', err);
    }
  }, [conversationId, loading, messages, selfId]);

  useEffect(() => {
    if (!highlightMessageId || loading) {
      return;
    }

    // Only highlight if messages are loaded and we haven't highlighted this message yet
    if (messages.length > 0) {
      const highlightMessage = () => {
        const selector = `[data-message-id="${highlightMessageId}"]`;
        const el = document.querySelector(selector) as HTMLElement | null;

        if (!el) {
          // If element not found, try again after a short delay
          setTimeout(highlightMessage, 100);
          return;
        }

        try {
          // Scroll to the message
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });

          // Apply highlight effect
          el.style.backgroundColor = 'rgba(253, 232, 138, 0.45)';
          el.style.transition = 'background-color 700ms ease';

          // Mark this message as highlighted
          highlightedMessageRef.current = highlightMessageId;

          // Remove highlight after 2 seconds
          setTimeout(() => {
            if (el) {
              el.style.backgroundColor = '';
              setTimeout(() => {
                if (el) {
                  el.style.transition = '';
                }
              }, 300);
            }
          }, 2000);
        } catch (error) {
          console.error('Failed to highlight message:', error);
        }
      };

      // Small delay to ensure DOM is fully rendered
      const timeoutId = setTimeout(highlightMessage, 100);

      return () => clearTimeout(timeoutId);
    }
  }, [highlightMessageId, loading, messages.length]);


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
      <div className="flex flex-col h-full min-h-0">
        <ChatHeader
          conversation={conversationData}
          onAssignAgent={() => setShowAgentDialog(true)}
          onShowDetails={() => setShowDetails(true)}
          onToggleSearch={() => setShowSearchBar((prev) => !prev)}
        />

        {showSearchBar && (
          <ChatSearchBar
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onClear={handleCloseSearch}
            currentIndex={currentSearchMatchIndex}
            totalMatches={conversationSearchResults.length}
            onNext={handleNextSearchMatch}
            onPrevious={handlePreviousSearchMatch}
            onClose={() => {
              handleCloseSearch();
              setShowSearchBar(false); 
            }}
          />
        )}


        <div
          ref={containerRef}
          className="flex-1 px-4 py-2 overflow-y-auto space-y-2 bg-white min-h-0"
          tabIndex={0}
        >
          {isThreaded ? (
            <ThreadedMessageList messages={messages} onReply={onReply} className="pt-1" selfId={selfId} searchTerm={searchQuery} />
          ) : (
            <>
              {messages.map((msg) => (
                <MessageBubble key={msg.id} message={msg} selfId={selfId} onReply={onReply} searchTerm={searchQuery} />
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
            <ConversationDetailsPanel conversationId={conversationId} conversation={conversationData} />
          )}
        </SheetContent>
      </Sheet>
    </>
  );
};

export default ChatWindow;
