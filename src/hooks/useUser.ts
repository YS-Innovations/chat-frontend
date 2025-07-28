// useUser.ts
import { useState, useEffect, useRef } from 'react';
import { useAuth0 } from '@auth0/auth0-react';

interface UserProfile {
  id: string;
  email?: string;
  name?: string;
  nickname?: string;
  picture?: string;
  role?: string;
  hasOnboarded?: boolean;
}

export default function useUser() {
  const { user, getAccessTokenSilently } = useAuth0();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const hasFetchedProfile = useRef<boolean>(false);

  const fetchUserProfile = async (): Promise<UserProfile | undefined> => {
    try {
      if (!user?.sub) return undefined;
      
      setIsLoading(true);
      setError(null);
      
      const token = await getAccessTokenSilently();
      const response = await fetch(`http://localhost:3000/auth/user/${user.sub}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch profile: ${response.statusText}`);
      }

      const data: UserProfile = await response.json();
      setProfile(data);
      return data;
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch profile');
      setProfile(null);
      return undefined;
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfilePicture = async (file: File): Promise<UserProfile> => {
    try {
      if (!user?.sub) throw new Error('User not authenticated');
      
      setIsLoading(true);
      setError(null);
      
      const token = await getAccessTokenSilently();
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(
        `http://localhost:3000/auth/user/${user.sub}/picture`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to upload profile picture');
      }

      const { pictureUrl } = await response.json();
      const updatedProfile = { ...(profile || {}), picture: pictureUrl } as UserProfile;
      setProfile(updatedProfile);
      return updatedProfile;
    } catch (error) {
      console.error('Error uploading profile picture:', error);
      setError(error instanceof Error ? error.message : 'Failed to upload profile picture');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user && !hasFetchedProfile.current) {
      fetchUserProfile();
      hasFetchedProfile.current = true;
    } else if (!user) {
      setIsLoading(false);
      hasFetchedProfile.current = false;
    }
  }, [user, getAccessTokenSilently]);

  return { 
    profile, 
    updateProfilePicture,
    isLoading, 
    error,
    fetchUserProfile 
  };
}