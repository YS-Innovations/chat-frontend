// hooks/useProfilePicture.ts
import { useEffect, useState, useCallback } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { toast } from 'sonner';

export function useProfilePicture() {
  const { user: auth0User, getAccessTokenSilently } = useAuth0();
  const [profilePicture, setProfilePicture] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProfilePicture = useCallback(async () => {
    try {
      if (!auth0User?.sub) return;

      const token = await getAccessTokenSilently();
      const response = await fetch(
        `http://localhost:3000/auth/user/${encodeURIComponent(auth0User.sub)}/picture`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch profile picture');
      }

      const data = await response.json();
      let pictureUrl = data.pictureUrl;

      if (pictureUrl && !pictureUrl.startsWith('https://')) {
        pictureUrl = `https://${pictureUrl.replace(/^https?:\/\//, '')}`;
      }

      setProfilePicture(pictureUrl);
    } catch (error) {
      console.error('Error fetching profile picture:', error);
      setProfilePicture(null);
      toast.error('Failed to load profile picture', {
        description: error instanceof Error ? error.message : 'Unknown error',
      });
    } finally {
      setIsLoading(false);
    }
  }, [auth0User?.sub, getAccessTokenSilently]);

  const uploadProfilePicture = useCallback(
    async (file: File) => {
      if (!file || !auth0User?.sub) return;

      try {
        setIsLoading(true);
        const token = await getAccessTokenSilently();
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch(
          `http://localhost:3000/auth/user/${auth0User.sub}/picture`,
          {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${token}`,
            },
            body: formData,
          }
        );

        if (!response.ok) {
          throw new Error('Failed to upload profile picture');
        }

        const data = await response.json();
        setProfilePicture(data.pictureUrl);
        toast.success('Profile picture updated successfully');
      } catch (error) {
        console.error('Error uploading profile picture:', error);
        toast.error('Failed to upload profile picture', {
          description: error instanceof Error ? error.message : 'Unknown error',
        });
      } finally {
        setIsLoading(false);
      }
    },
    [auth0User?.sub, getAccessTokenSilently]
  );

  useEffect(() => {
    fetchProfilePicture();
  }, [fetchProfilePicture]);

  return {
    profilePicture,
    isLoading,
    uploadProfilePicture,
    refetchProfilePicture: fetchProfilePicture,
  };
}
