// src/components/Sidebar/components/Nav/hooks/use-channels.ts
import { useState, useEffect, useCallback } from 'react';
import { useAuthShared } from '@/hooks/useAuthShared';
import { useWebSocket } from './useWebSocket'; // Assuming you have this hook

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
  const { on, isConnected } = useWebSocket();
  const [channels, setChannels] = useState<Channel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchChannels = useCallback(async () => {
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
  }, [getAccessTokenSilently]);

  useEffect(() => {
    fetchChannels();
  }, [fetchChannels]);

  // WebSocket listeners for real-time updates
  useEffect(() => {
    // Listen for channel creation events
    const unsubscribeCreate = on('channel:created', (data) => {
      console.log('Channel created via WebSocket:', data);
      
      // Add the new channel to the list
      setChannels(prev => {
        // Check if channel already exists to avoid duplicates
        const channelExists = prev.some(channel => channel.id === data.id);
        if (channelExists) return prev;
        
        // Format the new channel to match the existing structure
        const newChannel: Channel = {
          id: data.id,
          uuid: data.uuid || '',
          channelToken: data.channelToken,
          type: data.type,
          createdAt: data.createdAt,
          updatedAt: data.updatedAt,
          channelSettings: data.channelSettings || null
        };
        
        return [...prev, newChannel];
      });
    });

    // Listen for channel update events
    const unsubscribeUpdate = on('channel:updated', (data) => {
      console.log('Channel updated via WebSocket:', data);
      
      // Update the channel in the list
      setChannels(prev => prev.map(channel => 
        channel.id === data.id 
          ? { ...channel, ...data }
          : channel
      ));
    });

    // Listen for channel settings update events
    const unsubscribeSettingsUpdate = on('channelSettings:updated', (data) => {
      console.log('Channel settings updated via WebSocket:', data);
      
      // Update the channel with new settings
      setChannels(prev => prev.map(channel => 
        channel.id === data.channelId 
          ? { ...channel, channelSettings: data.settings }
          : channel
      ));
    });

    // Listen for channel deletion events
    const unsubscribeDelete = on('channel:deleted', (data) => {
      console.log('Channel deleted via WebSocket:', data);
      
      // Remove the channel from the list
      setChannels(prev => prev.filter(channel => channel.id !== data.channelId));
    });

    // Listen for channel restoration events
    const unsubscribeRestore = on('channel:restored', (data) => {
      console.log('Channel restored via WebSocket:', data);
      
      // Refetch channels to get the restored channel
      fetchChannels();
    });

    return () => {
      unsubscribeCreate();
      unsubscribeUpdate();
      unsubscribeSettingsUpdate();
      unsubscribeDelete();
      unsubscribeRestore();
    };
  }, [on, fetchChannels]);

  return { channels, loading, error, isConnected, refetch: fetchChannels };
}