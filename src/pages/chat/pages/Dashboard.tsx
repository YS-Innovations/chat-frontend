// src/pages/chat/pages/Dashboard.tsx
import React, { useState, useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';

import RichTextEditor from '../components/MessageInput/RichTextEditor';
import ConversationList from '../components/ConversationList/ConversationList';
import ChatWindow from '../components/ChatWindow/ChatWindow';
import LoadingSpinner from '@/components/Loading/LoadingSpinner';
import CreateChannelDialog from '@/pages/channel/CreateChannelDialog';
import { useChannels } from '@/hooks/useChannels';

const API_URL = import.meta.env.VITE_API_URL;

const Dashboard: React.FC = () => {
  const { channelId } = useParams<{ channelId: string }>();
  const navigate = useNavigate();
  const { getAccessTokenSilently } = useAuth0();
  const { channels, setChannels, loading } = useChannels({
    getAccessToken: getAccessTokenSilently,
    apiUrl: API_URL,
  });

  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [currentChannel, setCurrentChannel] = useState<string | undefined>(channelId);

  useEffect(() => {
    setCurrentChannel(channelId);
  }, [channelId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  if (channels.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-4">No Channels Found</h1>
        <p className="mb-4 text-muted-foreground">
          You need at least one channel to start using the dashboard.
        </p>
        <Button onClick={() => setShowCreateDialog(true)}>Create Channel</Button>

        <CreateChannelDialog
          open={showCreateDialog}
          onOpenChange={setShowCreateDialog}
          getAccessToken={getAccessTokenSilently}
          API_URL={API_URL}
          onSuccess={(channel) => {
            setChannels([channel]);
            toast.success('Channel created successfully!');
          }}
        />
      </div>
    );
  }

  const selectedChannel = currentChannel 
    ? channels.find(c => c.id === currentChannel)
    : null;

  return (
    <div className="h-full flex overflow-hidden">
      <div className="w-80 border-r bg-gray-50 h-full flex flex-col">
        {/* Channel header */}
        <div className="p-4 border-b bg-white">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">
              {selectedChannel 
                ? selectedChannel.channelSettings?.name || `Channel ${selectedChannel.id.slice(0, 8)}`
                : 'All Conversations'
              }
            </h2>
            {selectedChannel && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/app')}
              >
                View All
              </Button>
            )}
          </div>
          {selectedChannel && (
            <p className="text-sm text-muted-foreground mt-1">
              {selectedChannel.type} • {selectedChannel.channelSettings?.domain || 'No domain'}
            </p>
          )}
        </div>

        {/* Conversation list */}
        <div className="flex-1 overflow-hidden">
          <ConversationList 
            onSelectConversation={setSelectedConversationId}
            channelId={currentChannel}
          />
        </div>
      </div>

      <div className="flex-1 flex flex-col min-h-0">
        <ChatWindow conversationId={selectedConversationId} />
        <RichTextEditor conversationId={selectedConversationId} />
      </div>
    </div>
  );
};

export default Dashboard;