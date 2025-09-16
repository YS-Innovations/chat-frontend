// src/pages/chat/components/ConversationList/ConversationList.tsx
import React, { useState, useMemo, useEffect } from 'react';
import { Search, X, Filter } from 'lucide-react';
import ConversationItem from './ConversationItem';
import { useConversations } from '../../hooks/useConversations';
import { useConversationSearch } from '../../hooks/useConversationSearch';
import { useAvailableAgents } from '../../hooks/useAvailableAgents';
import { deleteConversation, type ConversationListItem } from '../../api/chatService';
import { useAuthShared } from '@/hooks/useAuthShared';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import LoadingSpinner from '@/components/Loading/LoadingSpinner';
import SearchFilters, { type SearchFiltersState } from '../Search/SearchFilters';

interface ConversationListProps {
  onSelectConversation: (id: string) => void;
  channelId?: string;
  selectedConversationId?: string | null;
  onAgentAssignmentChange?: () => void;
  conversations: ConversationListItem[];
  loading: boolean;
  onRefresh: () => void;
}

const ConversationList: React.FC<ConversationListProps> = ({ 
  onSelectConversation, 
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

  const displayedConversations = useMemo(() => {
    if (isSearching && results) {
      return results.results;
    }
    return conversations;
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
            placeholder="Search conversations, messages, guests..."
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
              {displayedConversations.length} conversation{displayedConversations.length !== 1 ? 's' : ''}
            </Badge>
            {isSearching && results && (
              <Badge variant="outline" className="text-xs">
                {results.totalCount} total matches
              </Badge>
            )}
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
            <Button variant="ghost" size="sm" onClick={onRefresh} disabled={loading || searchLoading}>
              Refresh
            </Button>
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
        {(searchLoading || loading) && displayedConversations.length === 0 ? (
          <div className="p-4 text-center">
            <LoadingSpinner />
          </div>
        ) : displayedConversations.length === 0 ? (
          <div className="p-4 text-center text-muted-foreground">
            {isSearching ? 'No conversations match your search' : 'No conversations found'}
          </div>
        ) : (
          <>
            {displayedConversations.map((conv: any) => (
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