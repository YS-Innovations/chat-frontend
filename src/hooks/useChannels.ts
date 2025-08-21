// src/hooks/useChannels.ts
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

interface UseChannelsOptions {
  getAccessToken: () => Promise<string>;
  apiUrl: string;
}

export function useChannels({ getAccessToken, apiUrl }: UseChannelsOptions) {
  const [channels, setChannels] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchChannels = async () => {
      try {
        const token = await getAccessToken();
        const res = await fetch(`${apiUrl}/channels`, {
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
  }, [getAccessToken, apiUrl]);

  return {
    channels,
    setChannels, // allows adding new channel after creation
    loading,
  };
}
