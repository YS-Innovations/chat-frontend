// Dashboard.tsx
import React, { useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
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
  const { getAccessTokenSilently } = useAuth0();
  const { channels, setChannels, loading } = useChannels({
    getAccessToken: getAccessTokenSilently,
    apiUrl: API_URL,
  });

  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);

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
            setChannels([channel]); // now the dashboard will render
            toast.success('Channel created successfully!');
          }}
        />
      </div>
    );
  }

  return (
    <div className="h-full flex overflow-hidden">
      <div className="w-80 border-r bg-gray-50 h-full">
        <ConversationList onSelectConversation={setSelectedConversationId} />
      </div>

      <div className="flex-1 flex flex-col min-h-0">
        <ChatWindow conversationId={selectedConversationId} />
        <RichTextEditor conversationId={selectedConversationId} />
      </div>
    </div>
  );
};

export default Dashboard;
