import { useEffect, useState } from 'react';
import { SessionExpiredDialog } from './SessionExpiredDialog';

export const useGlobalErrorHandler = () => {

  const [showExpiredDialog, setShowExpiredDialog] = useState(false);

  useEffect(() => {
    const handleError = (error: any) => {
      if (error?.message?.includes('Missing Refresh Token') || 
          error?.error?.includes('Missing Refresh Token') ||
          error?.message?.includes('invalid_token') ||
          error?.error?.includes('invalid_token') ||
          error?.message?.includes('token expired') ||
          error?.error?.includes('token expired')) {
        console.error('Authentication error detected:', error);
        setShowExpiredDialog(true);
      }
    };

    const handleUncaughtError = (event: ErrorEvent) => handleError(event.error);
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => handleError(event.reason);

    window.addEventListener('error', handleUncaughtError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', handleUncaughtError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  return { showExpiredDialog };
};

export const GlobalErrorHandler = ({ children }: { children: React.ReactNode }) => {
  const { showExpiredDialog } = useGlobalErrorHandler();

  return (
    <>
      {children}
      <SessionExpiredDialog open={showExpiredDialog} />
    </>
  );
};