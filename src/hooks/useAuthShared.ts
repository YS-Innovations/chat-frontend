import { useAuth0 } from '@auth0/auth0-react';

export const useAuthShared = () => {
  const {
    user,
    getAccessTokenSilently,
    isAuthenticated,
    isLoading,
    logout,
    loginWithRedirect,
    error,
  } = useAuth0();

  return {
    user,
    getAccessTokenSilently,
    isAuthenticated,
    isLoading,
    logout,
    loginWithRedirect,
    error,
  };
};

export type UseAuthSharedReturn = ReturnType<typeof useAuthShared>;


