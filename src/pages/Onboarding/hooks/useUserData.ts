// hooks/useUserData.ts
import { useEffect, useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import axios from 'axios';

export interface Organization {
  id?: string;
  name: string;
  website: string;
}

export interface UserData {
  organization?: Organization;
  hasOnboarded?: boolean;
}

export function useUserData() {
  const { user, getAccessTokenSilently } = useAuth0();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!user?.sub) return;

      try {
        const token = await getAccessTokenSilently();
        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}/auth/user/${user.sub}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setUserData(res.data);
      } catch (err) {
        setError('Failed to fetch user data.');
        console.error('Error fetching user data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [user?.sub, getAccessTokenSilently]);

  return { userData, setUserData, loading, error };
}