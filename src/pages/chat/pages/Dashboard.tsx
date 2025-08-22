// src/pages/chat/pages/Dashboard.tsx
import React, { useState, useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

import RichTextEditor from '../components/MessageInput/RichTextEditor';
import ConversationList from '../components/ConversationList/ConversationList';
import ChatWindow from '../components/ChatWindow/ChatWindow';
import LoadingSpinner from '@/components/Loading/LoadingSpinner';
import CreateChannelDialog from '@/pages/channel/CreateChannelDialog';
import { useChannels } from '@/hooks/useChannels';
import type { Message as ApiMessage } from '@/pages/chat/api/chatService';

const API_URL = import.meta.env.VITE_API_URL;

const Dashboard: React.FC = () => {
  const { channelId } = useParams<{ channelId: string }>();
  const { getAccessTokenSilently } = useAuth0();
  const { channels, setChannels, loading: channelsLoading, refresh: refreshChannels } = useChannels({
    getAccessToken: getAccessTokenSilently,
    apiUrl: API_URL,
  });

  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'unread' | 'archived'>('all');

  // Page-level reply state: when non-null, RichTextEditor shows the reply banner
  // and the outgoing message will include parentId.
  const [replyTo, setReplyTo] = useState<ApiMessage | null>(null);

  useEffect(() => {
    // Reset selected conversation when channel changes
    setSelectedConversationId(null);
    // also clear any reply state (we're switching channel)
    setReplyTo(null);
  }, [channelId]);

  // Clear reply state when conversation selection changes (avoid replying to a message from another convo)
  useEffect(() => {
    setReplyTo(null);
  }, [selectedConversationId]);

  if (channelsLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  if (channels.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center max-w-md mx-auto">
          <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold mb-2">No Channels Found</h1>
          <p className="mb-6 text-muted-foreground">
            Create your first channel to start receiving and managing conversations.
          </p>
          <Button onClick={() => setShowCreateDialog(true)} size="lg">
            Create Your First Channel
          </Button>
        </div>

        <CreateChannelDialog
          open={showCreateDialog}
          onOpenChange={setShowCreateDialog}
          getAccessToken={getAccessTokenSilently}
          API_URL={API_URL}
          onSuccess={(channel) => {
            setChannels([channel]);
            refreshChannels();
            toast.success('Channel created successfully!');
          }}
        />
      </div>
    );
  }

  return (
    <div className="h-full flex overflow-hidden bg-background">
      {/* Sidebar */}
      <div className="w-80 border-r bg-white flex flex-col h-full">
        {/* Channel Header */}
        <div className="p-4 border-b bg-white">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-lg">Conversations</h2>
          </div>

          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="w-full">
            <TabsList className="grid grid-cols-3">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="unread">Unread</TabsTrigger>
              <TabsTrigger value="archived">Archived</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Conversation List */}
        <div className="flex-1 overflow-hidden">
          <ConversationList
            onSelectConversation={(id) => {
              // ConversationList may call with '' when deleting/clearing selection; normalize to null
              setSelectedConversationId(id && id.length > 0 ? id : null);
            }}
            channelId={channelId}
            selectedConversationId={selectedConversationId}
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-0">
        {selectedConversationId ? (
          <>
            {/* 
              ChatWindow: forward onReply so MessageBubble -> ChatWindow -> Dashboard
              can set the replyTo state. ChatWindow should call onReply(message) when
              the reply icon is clicked in a message bubble.
            */}
            <ChatWindow
              conversationId={selectedConversationId}
              onReply={(m: ApiMessage) => {
                // Only set reply when the message belongs to the current conversation (safety)
                if (m && m.conversationId === selectedConversationId) {
                  setReplyTo(m);
                }
              }}
            />

            {/* RichTextEditor receives replyTo and handlers to cancel or clear reply after send */}
            <RichTextEditor
              conversationId={selectedConversationId}
              replyTo={replyTo}
              onCancelReply={() => setReplyTo(null)}
              onSent={() => {
                // Clear reply when message has been sent (editor also calls onSent after done)
                setReplyTo(null);
              }}
            />
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
                Choose a conversation from the list to start messaging
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
