import { useEffect, useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import AppLayout from '../layouts/AppLayout';
import LoadingSpinner from '../components/Loading/LoadingSpinner';
import ErrorPage from '@/pages/ErrorPage';

export const ProtectedRoutes = () => {
  const {
    isAuthenticated,
    isLoading,
    error,
    user,
    getAccessTokenSilently,
  } = useAuth0();

  const location = useLocation();
  const navigate = useNavigate();

  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    const checkAuthState = async () => {
      if (isLoading) return;

      if (!isAuthenticated) {
        try {
          await getAccessTokenSilently();
          setAuthChecked(true);
        } catch {
          setAuthChecked(true);
        }
        return;
      }

      try {
        const token = await getAccessTokenSilently();

        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}/auth/user/${user?.sub}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const userData = res.data;
        const isOwner = userData?.role?.toUpperCase() === 'OWNER';
        const isNewOwner = isOwner && !userData?.hasOnboarded;
        const isInAppRoutes = location.pathname.startsWith('/app');
        const isOnboardingRoute = location.pathname === '/onboarding';

        // Redirect new OWNER to onboarding
        if (isNewOwner && !isOnboardingRoute) {
          navigate('/onboarding', { replace: true });
          return;
        }

        // Redirect onboarded OWNER away from onboarding page
        if (!isNewOwner && isOnboardingRoute) {
          navigate('/app', { replace: true });
          return;
        }

        setAuthChecked(true);
      } catch (err) {
        console.error('Failed to fetch user data:', err);
        setAuthChecked(true); // Allow fallback to app layout
      }
    };

    checkAuthState();
  }, [
    isLoading,
    isAuthenticated,
    getAccessTokenSilently,
    user,
    navigate,
    location.pathname,
  ]);

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
