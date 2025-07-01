import { useEffect, useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import LoadingSpinner from '../components/Loading/LoadingSpinner';
import ErrorPage from '../pages/ErrorPage';

export const AdminOnlyRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, user, isLoading, getAccessTokenSilently, error } = useAuth0();
  const [isAdmin, setIsAdmin] = useState(false);
  const [checking, setChecking] = useState(true);
  const [checkError, setCheckError] = useState<unknown>(null);

  useEffect(() => {
    const checkAdmin = async () => {
      if (isAuthenticated && user) {
        try {
          const token = await getAccessTokenSilently();
          const response = await fetch(`http://localhost:3000/auth/user/${user.sub}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          
          if (!response.ok) {
            throw new Error('Failed to fetch user data');
          }

          const userData = await response.json();
          setIsAdmin(userData.role === 'ADMIN');
        } catch (err) {
          setCheckError(err);
        } finally {
          setChecking(false);
        }
      } else {
        setChecking(false);
      }
    };

    checkAdmin();
  }, [isAuthenticated, user]);

  if (error) {
    return <ErrorPage statusCode={401} error={error} />;
  }

  if (checkError) {
    return <ErrorPage statusCode={500} error={checkError} />;
  }

  if (isLoading || checking) {
    return <LoadingSpinner />;
  }

  return isAdmin ? children : <ErrorPage statusCode={403} />;
};