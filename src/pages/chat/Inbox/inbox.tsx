// src/pages/chat/pages/Inbox.tsx
import React, { useState, useCallback, useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import ConversationList from '../components/ConversationList/ConversationList';
import ChatWindow from '../components/ChatWindow/ChatWindow';
import RichTextEditor from '../components/MessageInput/RichTextEditor';
import LoadingSpinner from '@/components/Loading/LoadingSpinner';
import type { ConversationListItem } from '../api/chatService';

const API_BASE = import.meta.env.VITE_BACKEND_URL;

export const Inbox: React.FC = () => {
  const { getAccessTokenSilently, user } = useAuth0();
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [selectedConversation, setSelectedConversation] = useState<ConversationListItem | null>(null);
  const [conversations, setConversations] = useState<ConversationListItem[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchInboxConversations = useCallback(async () => {
    try {
      setLoading(true);
      const token = await getAccessTokenSilently();
      
      const response = await fetch(`${API_BASE}/conversations/inbox`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch inbox conversations: ${response.status}`);
      }
      
      const data = await response.json();
      setConversations(data);
      
      // Update selected conversation if it exists
      if (selectedConversationId) {
        const updatedConversation = data.find((c: ConversationListItem) => c.id === selectedConversationId);
        setSelectedConversation(updatedConversation || null);
      }
    } catch (error) {
      console.error('Failed to fetch inbox conversations:', error);
      toast.error('Failed to load inbox conversations');
    } finally {
      setLoading(false);
    }
  }, [getAccessTokenSilently, selectedConversationId]);

  const markConversationAsSeen = useCallback(async (conversationId: string) => {
    try {
      const token = await getAccessTokenSilently();
      await fetch(`${API_BASE}/conversations/${conversationId}/mark-seen`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      // Remove the conversation from the inbox list after marking as seen
    //   setConversations(prev => prev.filter(conv => conv.id !== conversationId));
    } catch (error) {
      console.error('Failed to mark conversation as seen:', error);
    }
  }, [getAccessTokenSilently]);

  const handleSelectConversation = useCallback(async (id: string) => {
    setSelectedConversationId(id);
    const foundConversation = conversations.find(c => c.id === id);
    setSelectedConversation(foundConversation || null);
    
    // Mark the conversation as seen when selected and remove from inbox
    await markConversationAsSeen(id);
  }, [conversations, markConversationAsSeen]);

  const handleAgentAssignmentChange = useCallback(async () => {
    await fetchInboxConversations();
    
    // Update the selected conversation with latest data
    if (selectedConversationId) {
      const token = await getAccessTokenSilently();
      try {
        const response = await fetch(`${API_BASE}/conversations/${selectedConversationId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        
        if (response.ok) {
          const updatedConv = await response.json();
          setSelectedConversation(updatedConv);
        }
      } catch (error) {
        console.error('Failed to fetch updated conversation:', error);
      }
    }
  }, [fetchInboxConversations, selectedConversationId, getAccessTokenSilently]);

  // Load inbox conversations on component mount
  useEffect(() => {
    fetchInboxConversations();
  }, [fetchInboxConversations]);

  if (!user?.sub) {
    return (
      <div className="flex justify-center items-center h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="h-full flex overflow-hidden bg-background">
      {/* Sidebar */}
      <div className="w-80 border-r bg-white flex flex-col h-full">
        {/* Header */}
        <div className="p-4 border-b bg-white">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-lg">Inbox</h2>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchInboxConversations}
              disabled={loading}
            >
              {loading ? 'Refreshing...' : 'Refresh'}
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            New conversations that need attention
          </p>
        </div>

        {/* Conversation List */}
        <div className="flex-1 overflow-hidden">
          <ConversationList
            onSelectConversation={handleSelectConversation}
            selectedConversationId={selectedConversationId}
            onAgentAssignmentChange={handleAgentAssignmentChange}
            conversations={conversations}
            loading={loading}
            onRefresh={fetchInboxConversations}
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-0">
        {selectedConversationId ? (
          <>
            <ChatWindow 
              conversationId={selectedConversationId} 
              selfId={user.sub}
              conversationData={selectedConversation}
              onAgentAssignmentChange={handleAgentAssignmentChange}
            />
            <div className="p-4 border-t bg-white">
              <RichTextEditor 
                conversationId={selectedConversationId} 
                selfId={user.sub} 
                onSent={fetchInboxConversations}
              />
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center max-w-sm mx-auto p-6">
              <div className="w-16 h-16 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium mb-2">Inbox is empty</h3>
              <p className="text-muted-foreground text-sm">
                All new conversations will appear here for you to respond to
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Inbox;