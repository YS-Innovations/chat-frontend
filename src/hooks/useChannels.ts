// src/hooks/useChannels.ts
import { useEffect, useState, useCallback } from 'react';
import { toast } from 'sonner';

interface UseChannelsOptions {
  getAccessToken: () => Promise<string>;
  apiUrl: string;
}

export function useChannels({ getAccessToken, apiUrl }: UseChannelsOptions) {
  const [channels, setChannels] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchChannels = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const token = await getAccessToken();
      const res = await fetch(`${apiUrl}/channels`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error('Failed to fetch channels');
      const data = await res.json();
      setChannels(data);
      return data;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to fetch channels');
      setError(error);
      console.error(err);
      toast.error('Failed to load channels');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [getAccessToken, apiUrl]);

  const refresh = useCallback(async () => {
    return await fetchChannels();
  }, [fetchChannels]);

  useEffect(() => {
    fetchChannels();
  }, [fetchChannels]);

  return {
    channels,
    setChannels,
    loading,
    error,
    refresh, // Add the refresh method
  };
}