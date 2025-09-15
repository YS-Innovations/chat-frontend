// hooks/useProfile.ts
import { useEffect, useState, useCallback } from 'react';
import { useAuthShared } from '@/hooks/useAuthShared';
import { toast } from 'sonner';

export interface UserProfile {
  name: string;
  email: string;
  nickname?: string;
  phoneNumber?: string;
  picture?: string;
}

export function useProfile() {
  const { user: auth0User, getAccessTokenSilently } = useAuthShared();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  const fetchProfile = useCallback(async () => {
    try {
      if (!auth0User?.sub) return;

      setIsLoading(true);
      const token = await getAccessTokenSilently();
      const response = await fetch(
        `http://localhost:3000/auth/user/${encodeURIComponent(auth0User.sub)}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch profile');
      }

      const userData = await response.json();
      setProfile({
        name: userData.name || '',
        email: userData.email || '',
        nickname: userData.nickname || '',
        phoneNumber: userData.phoneNumber || '',
        picture: userData.picture || '',
      });
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast.error('Failed to load profile', {
        description: error instanceof Error ? error.message : 'Unknown error',
      });
    } finally {
      setIsLoading(false);
    }
  }, [auth0User?.sub, getAccessTokenSilently]);

  const updateProfile = useCallback(
    async (updates: Partial<UserProfile>) => {
      if (!auth0User?.sub) return;

      try {
        setIsUpdating(true);
        const token = await getAccessTokenSilently();
        
        const response = await fetch(
          `http://localhost:3000/auth/user/${auth0User.sub}`,
          {
            method: 'PUT',
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(updates),
          }
        );

        if (!response.ok) {
          throw new Error('Failed to update profile');
        }

        const updatedUser = await response.json();
        setProfile(prev => prev ? { ...prev, ...updatedUser } : updatedUser);
        toast.success('Profile updated successfully');
        return updatedUser;
      } catch (error) {
        console.error('Error updating profile:', error);
        toast.error('Failed to update profile', {
          description: error instanceof Error ? error.message : 'Unknown error',
        });
        throw error;
      } finally {
        setIsUpdating(false);
      }
    },
    [auth0User?.sub, getAccessTokenSilently]
  );

  const uploadProfilePicture = useCallback(
    async (file: File) => {
      if (!file || !auth0User?.sub) return;

      try {
        setIsUpdating(true);
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
        setProfile(prev => prev ? { ...prev, picture: data.pictureUrl } : null);
        toast.success('Profile picture updated successfully');
      } catch (error) {
        console.error('Error uploading profile picture:', error);
        toast.error('Failed to upload profile picture', {
          description: error instanceof Error ? error.message : 'Unknown error',
        });
      } finally {
        setIsUpdating(false);
      }
    },
    [auth0User?.sub, getAccessTokenSilently]
  );

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  return {
    profile,
    isLoading,
    isUpdating,
    updateProfile,
    uploadProfilePicture,
    refetchProfile: fetchProfile,
  };
}