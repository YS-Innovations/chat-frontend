import RichTextEditor from '../components/MessageInput/RichTextEditor'
import React, { useEffect, useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import ConversationList from '../components/ConversationList/ConversationList';
import ChatWindow from '../components/ChatWindow/ChatWindow';
import LoadingSpinner from '@/components/Loading/LoadingSpinner';
import CreateChannelDialog from '@/pages/channel/CreateChannelDialog';

const API_URL = import.meta.env.VITE_API_URL;

const Dashboard: React.FC = () => {
  const { getAccessTokenSilently } = useAuth0();

  const [channels, setChannels] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);

  // Fetch channels on mount
  useEffect(() => {
    const fetchChannels = async () => {
      try {
        const token = await getAccessTokenSilently();
        const res = await fetch(`${API_URL}/channels`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!res.ok) throw new Error('Failed to fetch channels');
        const data = await res.json();
        setChannels(data);
      } catch (err) {
        console.error(err);
        toast.error('Failed to load channels');
      } finally {
        setLoading(false);
      }
    };

    fetchChannels();
  }, [getAccessTokenSilently]);

  // Show loading screen
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  // No channels found — show create channel screen
  if (channels.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-4">No Channels Found</h1>
        <p className="mb-4 text-muted-foreground">You need at least one channel to start using the dashboard.</p>
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

  // User has at least one channel — show dashboard
  return (
    // Prevent page scrolling and make the viewport a fixed-height flex container
    <div className="h-full flex overflow-hidden">
      {/* Sidebar: full height so inner list can scroll */}
      <div className="w-80 border-r bg-gray-50 h-full">
        <ConversationList onSelectConversation={setSelectedConversationId} />
      </div>

      {/* Chat area: column layout where ChatWindow grows and editor is fixed-height */}
      {/* min-h-0 is essential so children can scroll (prevents overflowing the flex column) */}
      <div className="flex-1 flex flex-col min-h-0">
        <ChatWindow conversationId={selectedConversationId} />
        <RichTextEditor conversationId={selectedConversationId} />
      </div>
    </div>
  );
};

export default Dashboard;
