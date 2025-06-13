// src/hooks/useAuth.ts
import { useAuth0 } from '@auth0/auth0-react';
import { useNavigate } from 'react-router-dom';

export const useAuth = () => {
  const { 
    isAuthenticated, 
    loginWithRedirect, 
    logout, 
    user, 
    isLoading 
  } = useAuth0();
  
  const navigate = useNavigate();

  const handleLogin = () => {
    if (isAuthenticated) {
      navigate('/app');
    } else {
      loginWithRedirect({
        appState: { returnTo: '/app' }
      });
    }
  };

  const handleLogout = () => {
    logout({ logoutParams: { returnTo: window.location.origin } });
  };

  return {
    isAuthenticated,
    user,
    isLoading,
    handleLogin,
    handleLogout
  };
};