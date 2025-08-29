import { useRouteError, isRouteErrorResponse } from 'react-router-dom';
import { useEffect } from 'react';
import { useAuthShared } from '@/hooks/useAuthShared';

type ErrorPageProps = {
  statusCode?: number;
  error?: unknown;
};

const ErrorPage = ({ statusCode, error: propError }: ErrorPageProps) => {
  const routeError = useRouteError();
  const { logout } = useAuthShared();
  
  // Combine different error sources
  const error = propError || routeError || null;
  
  // Get error message safely
  const getErrorMessage = (err: unknown): string => {
    if (typeof err === 'string') return err;
    if (err instanceof Error) return err.message;
    if (isRouteErrorResponse(err)) return err.statusText;
    return 'Unknown error';
  };

  // Get status code safely
  const getStatusCode = (): number => {
    if (statusCode) return statusCode;
    if (isRouteErrorResponse(routeError)) return routeError.status;
    return 0;
  };

  const status = getStatusCode();
  const errorMessage = getErrorMessage(error);
  
  useEffect(() => {
    // Auto-logout on 401 errors
    if (status === 401) {
      logout({ logoutParams: { returnTo: window.location.origin } });
    }
  }, [status, logout]);

  let title = 'An unexpected error occurred';
  let description = 'Please try again later';

  switch (status) {
    case 401:
      title = 'Unauthorized';
      description = 'You need to be logged in to access this page';
      break;
    case 403:
      title = 'Forbidden';
      description = 'You do not have permission to access this resource';
      break;
    case 404:
      title = 'Page Not Found';
      description = 'The page you are looking for does not exist';
      break;
    case 500:
      title = 'Server Error';
      description = 'Something went wrong on our server';
      break;
    default:
      if (errorMessage) {
        description = errorMessage;
      }
      break;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
      <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-lg text-center">
        <div className="text-6xl font-bold text-indigo-600 mb-4">{status || 'Error'}</div>
        <h1 className="text-2xl font-bold text-gray-800 mb-2">{title}</h1>
        <p className="text-gray-600 mb-6">{description}</p>
        
        <div className="bg-gray-100 p-4 rounded-lg text-left text-sm text-gray-700 mt-4">
          <p className="font-medium">Error details:</p>
          <p>{errorMessage}</p>
        </div>

        <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
          >
            Reload Page
          </button>
          <button
            onClick={() => window.location.href = '/'}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
          >
            Go to Home
          </button>
          {status === 401 && (
            <button
              onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
            >
              Login Again
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ErrorPage;