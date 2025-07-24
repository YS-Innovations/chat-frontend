import { useState, useEffect, useRef } from 'react';
import { useAuth0 } from '@auth0/auth0-react';

export default function useUser() {
  const { user, getAccessTokenSilently } = useAuth0();
  const [profile, setProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Ref to track if fetchUserProfile has already been called
  const hasFetchedProfile = useRef(false);

  const fetchUserProfile = async () => {
    try {
      const token = await getAccessTokenSilently();
      const response = await fetch(`http://localhost:3000/auth/user/${user?.sub}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch profile');
      }
      
      const data = await response.json();
      setProfile(data);
      return data;
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
      setProfile(null);
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async (formData: any) => {
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
      
      const updatedProfile = await response.json();
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
