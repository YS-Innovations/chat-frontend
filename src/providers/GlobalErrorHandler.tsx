import { useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';

export const useGlobalErrorHandler = () => {
  const { logout } = useAuth0();

  useEffect(() => {
    const handleError = (error: any) => {
      // Check for Auth0 token-related errors
      if (error?.message?.includes('Missing Refresh Token') || 
          error?.error?.includes('Missing Refresh Token') ||
          error?.message?.includes('invalid_token') ||
          error?.error?.includes('invalid_token') ||
          error?.message?.includes('token expired') ||
          error?.error?.includes('token expired')) {
        console.error('Authentication error detected, logging out:', error);
        logout({ logoutParams: { returnTo: window.location.origin } });
      }
    };

    // Handle uncaught errors
    const handleUncaughtError = (event: ErrorEvent) => {
      handleError(event.error);
    };

    // Handle unhandled promise rejections
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      handleError(event.reason);
    };

    // Add event listeners
    window.addEventListener('error', handleUncaughtError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    // Cleanup
    return () => {
      window.removeEventListener('error', handleUncaughtError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, [logout]);
};

export const GlobalErrorHandler = ({ children }: { children: React.ReactNode }) => {
  useGlobalErrorHandler();
  return <>{children}</>;
};