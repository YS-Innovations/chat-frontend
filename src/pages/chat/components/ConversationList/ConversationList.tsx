import React, { useState, useMemo } from 'react';
import { Search, X } from 'lucide-react';
import ConversationItem from './ConversationItem';
import { useConversations } from '../../hooks/useConversations';
import { deleteConversation, type ConversationListItem } from '../../api/chatService';
import { useAuth0 } from '@auth0/auth0-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import LoadingSpinner from '@/components/Loading/LoadingSpinner';

interface ConversationListProps {
  onSelectConversation: (id: string) => void;
  channelId?: string;
  selectedConversationId?: string | null;
  onAgentAssignmentChange?: () => void;
}

const ConversationList: React.FC<ConversationListProps> = ({ 
  onSelectConversation, 
  channelId,
  selectedConversationId,
  onAgentAssignmentChange 
}) => {
  const { conversations, loading, error, refresh, loadMore, hasMore } = useConversations(channelId);
  const [searchTerm, setSearchTerm] = useState('');
  const { getAccessTokenSilently } = useAuth0();

  const filteredConversations = useMemo(() => {
    if (!searchTerm) return conversations;
    
    return conversations.filter(conv =>
      conv.guestName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      conv.guestId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      conv.agent?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      conv.agent?.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [conversations, searchTerm]);

  const handleDelete = async (id: string) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this conversation? This action cannot be undone.');
    if (!confirmDelete) return;

    try {
      const token = await getAccessTokenSilently();
      await deleteConversation(id, token);
      await refresh();
      if (selectedConversationId === id) {
        onSelectConversation('');
      }
    } catch (err) {
      console.error('Failed to delete conversation:', err);
      alert('Failed to delete conversation. Please try again.');
    }
  };

  const handleLoadMore = () => {
    if (hasMore && !loading) {
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

  if (error) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-4 text-center">
        <div className="text-red-500 mb-2">Error loading conversations</div>
        <Button variant="outline" onClick={refresh} className="mb-2">
          Try Again
        </Button>
        <div className="text-sm text-muted-foreground">{error.message}</div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Search Header */}
      <div className="p-3 border-b">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search conversations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 pr-9"
          />
          {searchTerm && (
            <X 
              className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground cursor-pointer"
              onClick={() => setSearchTerm('')}
            />
          )}
        </div>
        
        <div className="flex items-center justify-between mt-2">
          <Badge variant="secondary" className="text-xs">
            {filteredConversations.length} conversation{filteredConversations.length !== 1 ? 's' : ''}
          </Badge>
          <Button variant="ghost" size="sm" onClick={refresh} disabled={loading}>
            Refresh
          </Button>
        </div>
      </div>

      {/* Conversation List */}
      <div className="flex-1 overflow-y-auto">
        {filteredConversations.length === 0 ? (
          <div className="p-4 text-center text-muted-foreground">
            {searchTerm ? 'No conversations match your search' : 'No conversations found'}
          </div>
        ) : (
          <>
            {filteredConversations.map((conv: ConversationListItem) => (
              <ConversationItem
                key={conv.id}
                conversation={conv}
                selected={conv.id === selectedConversationId}
                onSelect={onSelectConversation}
                onDelete={handleDelete}
                onAgentAssignmentChange={onAgentAssignmentChange}
              />
            ))}
            
            {hasMore && (
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