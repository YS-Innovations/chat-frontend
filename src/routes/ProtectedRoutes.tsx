import { useEffect, useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { Navigate, useLocation } from 'react-router-dom';
import AppLayout from '../components/layouts/AppLayout';
import LoadingSpinner from '../components/Loading/LoadingSpinner';
import ErrorPage from '@/pages/ErrorPage';

export const ProtectedRoutes = () => {
  const { isAuthenticated, isLoading, error, getAccessTokenSilently } = useAuth0();
  const location = useLocation();
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    const checkAuthState = async () => {
      if (!isLoading) {
        if (!isAuthenticated) {
          try {
            // Silent check for existing session
            await getAccessTokenSilently();
            setAuthChecked(true);
          } catch {
            // No valid session
            setAuthChecked(true);
          }
        } else {
          setAuthChecked(true);
        }
      }
    };

    checkAuthState();
  }, [isLoading, isAuthenticated]);

  if (isLoading || !authChecked) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <ErrorPage statusCode={401} error={error} />;
  }

  return isAuthenticated ? (
    <AppLayout />
  ) : (
    <Navigate to="/" state={{ from: location }} replace />
  );
};