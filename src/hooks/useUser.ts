import { useState, useEffect, useRef } from 'react';
import { useAuth0 } from '@auth0/auth0-react';

// Define the user profile interface matching your API response
interface UserProfile {
  id: string;
  email?: string;
  name?: string;
  nickname?: string;
  picture?: string;
  // Add other profile fields as needed
}

export default function useUser() {
  const { user, getAccessTokenSilently } = useAuth0();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Ref to track if fetchUserProfile has already been called
  const hasFetchedProfile = useRef<boolean>(false);

const fetchUserProfile = async (): Promise<UserProfile | undefined> => {
  try {
    const token = await getAccessTokenSilently();
    const response = await fetch(`http://localhost:3000/auth/user/${user?.sub}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch profile');
    }

    // Check if response has content before parsing JSON
    const text = await response.text();

    if (!text) {
      console.warn('Response body is empty');
      setProfile(null);
      return undefined;
    }

    const data: UserProfile = JSON.parse(text);
    setProfile(data);
    return data;

  } catch (error) {
    console.error('Failed to fetch user profile:', error);
    setProfile(null);
    return undefined;
  } finally {
    setIsLoading(false);
  }
};


  const updateProfile = async (formData: Partial<UserProfile>): Promise<UserProfile> => {
    try {
      const token = await getAccessTokenSilently();
      const response = await fetch(`http://localhost:3000/auth/user/${user?.sub}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update profile');
      }
      
      const updatedProfile: UserProfile = await response.json();
      setProfile(updatedProfile);
      return updatedProfile;
    } catch (error) {
      console.error('Failed to update profile:', error);
      throw error;
    }
  };

  useEffect(() => {
    if (user && !hasFetchedProfile.current) {
      fetchUserProfile();
      hasFetchedProfile.current = true;
    } else if (!user) {
      setIsLoading(false);
      hasFetchedProfile.current = false; // reset for next login
    }
  }, [user, getAccessTokenSilently]);

  return { profile, updateProfile, isLoading, fetchUserProfile };
}
