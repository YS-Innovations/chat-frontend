// src/components/Sidebar/components/Nav/hooks/use-channels.ts
import { useState, useEffect } from 'react';
import { useAuthShared } from '@/hooks/useAuthShared';

export interface Channel {
  id: string;
  uuid: string;
  channelToken: string;
  type: 'WEB' | 'WHATSAPP';
  createdAt: string;
  updatedAt: string;
  channelSettings?: {
    id: string;
    channelId: string;
    name?: string;
    domain?: string;
    theme: 'light' | 'dark';
    primaryColor: string;
    position: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
    showBranding: boolean;
    showHelpTab: boolean;
    allowUploads: boolean;
    csatEnabled: boolean;
    updatedAt: string;
  } | null;
}

export function useChannels() {
  const { getAccessTokenSilently } = useAuthShared();
  const [channels, setChannels] = useState<Channel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchChannels = async () => {
      try {
        setLoading(true);
        const token = await getAccessTokenSilently();
        const API_URL = import.meta.env.VITE_API_URL;
        
        const response = await fetch(`${API_URL}/channels`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch channels');
        }

        const data = await response.json();
        setChannels(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
        console.error('Failed to load channels:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchChannels();
  }, [getAccessTokenSilently]);

  return { channels, loading, error };
}