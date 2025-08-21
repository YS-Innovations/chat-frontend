import React, { useEffect, useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { toast } from 'sonner';
import LoadingSpinner from '@/components/Loading/LoadingSpinner';

interface Channel {
  id: string;
  uuid: string;
  channelToken: string;
  type: 'WEB' | 'WHATSAPP';
  createdAt: string;
  updatedAt: string;
  channelSettings?: {
    name?: string;
  };
}

const API_URL = import.meta.env.VITE_API_URL;

const ChannelNamesPage: React.FC = () => {
  const { getAccessTokenSilently } = useAuth0();
  const [channels, setChannels] = useState<Channel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchChannelNames = async () => {
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
        setError(err instanceof Error ? err.message : 'Something went wrong');
        toast.error('Could not load channel names');
      } finally {
        setLoading(false);
      }
    };

    fetchChannelNames();
  }, [getAccessTokenSilently]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center mt-10 text-destructive">
        {error}
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">Channel Names</h1>
      <ul className="list-disc pl-5 space-y-2">
        {channels.map((channel) => (
          <li key={channel.id}>
            {channel.channelSettings?.name || 'Unnamed Channel'}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ChannelNamesPage;
