// src/pages/chat/pages/AssignedConversations.tsx
import React, { useState, useCallback } from 'react';
import { useAuthShared } from '@/hooks/useAuthShared';
import { toast } from 'sonner';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import LoadingSpinner from '@/components/Loading/LoadingSpinner';
import ConversationList from '../../components/ConversationList/ConversationList';
import ChatWindow from '../../components/ChatWindow/ChatWindow';
import RichTextEditor from '../../components/ChatTextArea/RichTextEditor';
import type { ConversationListItem } from '../../types/ChatApiTypes';
// import type { Message as ApiMessage } from '../api/chatService';

const API_URL = import.meta.env.VITE_BACKEND_URL;

export const AssignedConversations: React.FC = () => {
  const { getAccessTokenSilently, user } = useAuthShared();
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [selectedConversation, setSelectedConversation] = useState<ConversationListItem | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'open' | 'closed'>('all');
  const [conversations, setConversations] = useState<ConversationListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [highlightMessageId, setHighlightMessageId] = useState<string | null>(null);
  const [selectedConversationForHighlight, setSelectedConversationForHighlight] = useState<string | null>(null);

  const API_BASE = import.meta.env.VITE_BACKEND_URL;
  if (!API_BASE) {
    throw new Error('VITE_BACKEND_URL is not defined');
  }

  // Function to handle message selection from search results
  const handleSelectMessageFromSearch = useCallback((conversationId: string, messageId: string) => {
    // If we're already in the right conversation, just highlight the message
    if (selectedConversationId === conversationId) {
      setHighlightMessageId(messageId);
    } else {
      // If we need to switch conversations, store both values
      setSelectedConversationForHighlight(conversationId);
      setHighlightMessageId(messageId);
      setSelectedConversationId(conversationId);
    }
    
    // Clear highlight after 3 seconds (gives time for loading)
    setTimeout(() => {
      setHighlightMessageId(null);
      setSelectedConversationForHighlight(null);
    }, 3000);
  }, [selectedConversationId]);

  // Effect to apply highlight when conversation changes to match the searched message
  React.useEffect(() => {
    if (selectedConversationId && selectedConversationForHighlight === selectedConversationId && highlightMessageId) {
      // The highlight will be handled by the ChatWindow's useEffect
    }
  }, [selectedConversationId, selectedConversationForHighlight, highlightMessageId]);

  const fetchAssignedConversations = useCallback(async () => {
    try {
      setLoading(true);
      const token = await getAccessTokenSilently();
      
      // Debug: log the user ID being used
      console.log('Fetching conversations for user:', user?.sub);
      
      const response = await fetch(`${API_BASE}/conversations/Myconversation`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch assigned conversations: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Received conversations:', data); // Debug: see what's returned
      
      setConversations(data);
      
      // Update selected conversation if it exists
      if (selectedConversationId) {
        const updatedConversation = data.find((c: ConversationListItem) => c.id === selectedConversationId);
        setSelectedConversation(updatedConversation || null);
      }
    } catch (error) {
      console.error('Failed to fetch assigned conversations:', error);
      toast.error('Failed to load assigned conversations');
    } finally {
      setLoading(false);
    }
  }, [getAccessTokenSilently, selectedConversationId, user?.sub]); // Added user?.sub to dependencies

  const handleSelectConversation = useCallback((id: string) => {
    setSelectedConversationId(id);
    const foundConversation = conversations.find(c => c.id === id);
    setSelectedConversation(foundConversation || null);
    // Clear any existing highlight when selecting a new conversation
    setHighlightMessageId(null);
    setSelectedConversationForHighlight(null);
  }, [conversations]);

  const handleAgentAssignmentChange = useCallback(async () => {
    await fetchAssignedConversations();
    
    // Update the selected conversation with latest data
    if (selectedConversationId) {
      const token = await getAccessTokenSilently();
      try {
        const response = await fetch(`${API_URL}/conversations/${selectedConversationId}`, {
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
  }, [fetchAssignedConversations, selectedConversationId, getAccessTokenSilently]);

  // Load assigned conversations on component mount
  React.useEffect(() => {
    fetchAssignedConversations();
  }, [fetchAssignedConversations]);

  const filteredConversations = React.useMemo(() => {
    if (activeTab === 'all') return conversations;
    return conversations.filter(conv => 
      activeTab === 'open' 
        ? conv.currentStatus === 'OPEN'
        : conv.currentStatus === 'CLOSED'
    );
  }, [conversations, activeTab]);

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
            <h2 className="font-semibold text-lg">My Inbox</h2>
          </div>

          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="w-full">
            <TabsList className="grid grid-cols-3">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="open">Open</TabsTrigger>
              <TabsTrigger value="closed">Closed</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Conversation List */}
        <div className="flex-1 overflow-hidden">
          <ConversationList
            onSelectConversation={handleSelectConversation}
            selectedConversationId={selectedConversationId}
            onAgentAssignmentChange={handleAgentAssignmentChange}
            conversations={filteredConversations}
            loading={loading}
            onRefresh={fetchAssignedConversations}
            onSelectMessage={handleSelectMessageFromSearch}
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
              highlightMessageId={highlightMessageId}
            />
            <div className="p-4 border-t bg-white">
              <RichTextEditor 
                conversationId={selectedConversationId} 
                selfId={user.sub} 
                onSent={fetchAssignedConversations}
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
              <h3 className="text-lg font-medium mb-2">Select a conversation</h3>
              <p className="text-muted-foreground text-sm">
                Choose a conversation from your assigned list to start messaging
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};