import { useAuth0 } from '@auth0/auth0-react';
import { Button } from './ui/button';
import { useNavigate } from 'react-router-dom';

export default function AuthButton() {
  const { isAuthenticated, loginWithRedirect, logout } = useAuth0();
  const navigate = useNavigate();

  const handleAuthClick = () => {
    if (isAuthenticated) {
      navigate('/app');
    } else {
      loginWithRedirect({
        appState: { returnTo: window.location.pathname }
      });
    }
  };

  if (!isAuthenticated) {
    return (
      <Button onClick={handleAuthClick} className="bg-blue-600 hover:bg-blue-700">
        Sign In
      </Button>
    );
  }

  return (
    <Button
      onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })}
      variant="destructive"
    >
      Logout
    </Button>
  );
}