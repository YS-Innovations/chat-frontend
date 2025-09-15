import { useEffect, useState, useRef } from 'react';
import { useAuthShared } from '@/hooks/useAuthShared';
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
  const { user, getAccessTokenSilently } = useAuthShared();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Ref to track whether we've already fetched user data
  const hasFetched = useRef(false);
  const fetchUserData = async () => {
    if (!user?.sub) return;

    try {
      const token = await getAccessTokenSilently();
      const res = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/auth/user/${user.sub}`,
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

  useEffect(() => {
    if (!hasFetched.current && user?.sub) {
      fetchUserData();
      hasFetched.current = true;
    }
  }, [user?.sub, getAccessTokenSilently]);

  return { userData, setUserData, loading, error };
}
