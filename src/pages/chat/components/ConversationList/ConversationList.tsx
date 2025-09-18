// src/pages/chat/components/ConversationList/ConversationList.tsx
import React, { useState, useMemo, useEffect } from 'react';
import { Search, X, Filter } from 'lucide-react';
import ConversationItem from './ConversationItem';
import { useConversations } from '../../hooks/useConversations';
import { useConversationSearch } from '../../hooks/useConversationSearch';
import { useAvailableAgents } from '../../hooks/useAvailableAgents';
import { deleteConversation, type ConversationListItem, type MessageMatch } from '../../api/chatService';
import { useAuthShared } from '@/hooks/useAuthShared';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import LoadingSpinner from '@/components/Loading/LoadingSpinner';
import SearchFilters, { type SearchFiltersState } from '../Search/SearchFilters';
import { Highlight } from '../Search/Highlight';
import sanitizeAndHighlight from '../sanitizeAndHighlight';

interface ConversationListProps {
  onSelectConversation: (id: string) => void;
  channelId?: string;
  selectedConversationId?: string | null;
  onAgentAssignmentChange?: () => void;
  conversations: ConversationListItem[];
  loading: boolean;
  onRefresh: () => void;
  onSelectMessage?: (conversationId: string, messageId: string) => void;
}

const ConversationList: React.FC<ConversationListProps> = ({
  onSelectConversation,
  onSelectMessage,
  channelId,
  selectedConversationId,
  onAgentAssignmentChange,
  conversations,
  loading,
  onRefresh
}) => {
  const { error, refresh, loadMore, hasMore } = useConversations(channelId);
  const { search, loading: searchLoading, results, clearResults } = useConversationSearch();
  const { agents: availableAgents, loading: agentsLoading } = useAvailableAgents();
  const { getAccessTokenSilently } = useAuthShared();

  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<SearchFiltersState>({});
  const [isSearching, setIsSearching] = useState(false);

  // Debounced search
  useEffect(() => {
    const handler = setTimeout(() => {
      if (searchTerm.trim() || Object.values(filters).some(v => v !== undefined)) {
        performSearch();
      } else {
        clearResults();
        setIsSearching(false);
      }
    }, 500);

    return () => clearTimeout(handler);
  }, [searchTerm, filters]);

  const performSearch = async () => {
    if (!searchTerm.trim() && !Object.values(filters).some(v => v !== undefined)) {
      return;
    }

    setIsSearching(true);
    try {
      await search({
        query: searchTerm.trim() || undefined,
        ...filters,
        channelId,
        limit: 50,
        offset: 0
      });
    } catch (error) {
      console.error('Search failed:', error);
    }
  };

  const handleFiltersChange = (newFilters: Partial<SearchFiltersState>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const handleClearSearch = () => {
    setSearchTerm('');
    setFilters({});
    clearResults();
    setIsSearching(false);
  };

  // Group search results by conversation
  const { matchingConversations, allMessageMatches } = useMemo(() => {
    if (!isSearching || !results) {
      return { matchingConversations: conversations, allMessageMatches: [] };
    }

    // Get unique conversations from search results
    const conversationMap = new Map();
    const messageMatches: (MessageMatch & { conversationId: string; guestName: string })[] = [];

    results.results.forEach((conv: any) => {
      if (!conversationMap.has(conv.id)) {
        conversationMap.set(conv.id, { ...conv, messageMatches: [] });
      }

      if (conv.messageMatches && conv.messageMatches.length > 0) {
        conversationMap.get(conv.id).messageMatches = conv.messageMatches;
        messageMatches.push(...conv.messageMatches.map((match: MessageMatch) => ({
          ...match,
          conversationId: conv.id,
          guestName: conv.guestName || `Guest ${conv.guestId.slice(0, 8)}`
        })));
      }
    });

    return {
      matchingConversations: Array.from(conversationMap.values()),
      allMessageMatches: messageMatches
    };
  }, [conversations, results, isSearching]);



  const handleDelete = async (id: string) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this conversation? This action cannot be undone.');
    if (!confirmDelete) return;

    try {
      const token = await getAccessTokenSilently();
      await deleteConversation(id, token);
      await onRefresh();
      if (selectedConversationId === id) {
        onSelectConversation('');
      }
    } catch (err) {
      console.error('Failed to delete conversation:', err);
      alert('Failed to delete conversation. Please try again.');
    }
  };

  const handleLoadMore = () => {
    if (hasMore && !loading && !isSearching) {
      loadMore();
    }
  };

  if (loading && conversations.length === 0) {
    return (
      <div className="h-full flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Search Header */}
      <div className="p-3 border-b space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 pr-9"
          />
          {searchTerm && (
            <X
              className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground cursor-pointer"
              onClick={handleClearSearch}
            />
          )}
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-xs">
              {matchingConversations.length} conversation{matchingConversations.length !== 1 ? 's' : ''}
            </Badge>
            {/* {isSearching && results && (
              <Badge variant="outline" className="text-xs">
                {results.totalCount} total matches
              </Badge>
            )} */}
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className={showFilters ? 'bg-accent' : ''}
            >
              <Filter className="h-4 w-4 mr-1" />
              Filters
            </Button>
            {/* <Button variant="ghost" size="sm" onClick={onRefresh} disabled={loading || searchLoading}>
              Refresh
            </Button> */}
          </div>
        </div>

        {showFilters && (
          <SearchFilters
            query={searchTerm}
            onQueryChange={setSearchTerm}
            filters={filters}
            onFiltersChange={handleFiltersChange}
            onClear={handleClearSearch}
            availableAgents={availableAgents}
          />
        )}
      </div>

      {/* Conversation List */}
      <div className="flex-1 overflow-y-auto">
        {(searchLoading || loading) && matchingConversations.length === 0 ? (
          <div className="p-4 text-center">
            <LoadingSpinner />
          </div>
        ) : matchingConversations.length === 0 ? (
          <div className="p-4 text-center text-muted-foreground">
            {isSearching ? 'No conversations match your search' : 'No conversations found'}
          </div>
        ) : (
          <>

            {isSearching && results && (
              <h3 className="font-semibold text-sm text-gray-700 mb-3 pt-4">
                Chats ({matchingConversations.length})
              </h3>
            )}
            {/* Matching Conversations */}
            {matchingConversations.map((conv: any) => (
              <ConversationItem
                key={conv.id}
                conversation={conv}
                selected={conv.id === selectedConversationId}
                onSelect={onSelectConversation}
                onDelete={handleDelete}
                onAgentAssignmentChange={onAgentAssignmentChange}
                searchMatches={conv.messageMatches || []}
                searchTerm={searchTerm}
              />
            ))}

            {/* Matching Messages Section */}
            {isSearching && allMessageMatches.length > 0 && (
              <div className="border-t border-gray-200 pt-4">
                <h3 className="font-semibold text-sm text-gray-700 mb-3">
                  Messages ({allMessageMatches.length})
                </h3>
                <div className="space-y-3">
                  {allMessageMatches.map((match: MessageMatch & { conversationId: string; guestName: string }) => (
                    <div
                      key={`${match.conversationId}-${match.id}`}
                      className="p-3 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors relative"
                      onClick={() => {
                        if (onSelectMessage) {
                          onSelectMessage(match.conversationId, match.id);

                          // Add a temporary loading indicator
                          const element = document.getElementById(`search-result-${match.id}`);
                          if (element) {
                            element.classList.add('bg-blue-50');
                            setTimeout(() => {
                              element.classList.remove('bg-blue-50');
                            }, 2000);
                          }
                        } else {
                          onSelectConversation(match.conversationId);
                        }
                      }}
                      id={`search-result-${match.id}`}
                    >
                      <div className="flex items-start gap-2">
                        <div className="flex justify-between items-center w-full">
                          <div className="font-medium text-sm text-gray-900">
                            <Highlight text={match.guestName} searchTerm={searchTerm} />
                          </div>
                          {match.createdAt && (
                            <div className="text-xs text-gray-500 whitespace-nowrap">
                              {new Date(match.createdAt).toLocaleString()}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="text-sm text-gray-700 rounded">
                        <div
                          dangerouslySetInnerHTML={{
                            __html: sanitizeAndHighlight(match.content || '', searchTerm)
                          }}
                          className="line-clamp-2"
                        />

                      </div>

                      {/* Loading indicator that shows when clicked */}
                      <div className="absolute inset-0 bg-blue-50 opacity-0 transition-opacity duration-300 pointer-events-none"
                        id={`loading-${match.id}`}>
                        <div className="absolute right-2 top-2 w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {hasMore && !isSearching && (
              <div className="p-4 text-center">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLoadMore}
                  disabled={loading}
                >
                  {loading ? 'Loading...' : 'Load More'}
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ConversationList;