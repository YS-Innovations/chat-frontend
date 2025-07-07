import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';

export function useAcceptInvite() {
  const { loginWithRedirect } = useAuth0();
  const navigate = useNavigate();
  const location = useLocation();

  const [token, setToken] = useState('');
  const [email, setEmail] = useState('');
  const [orgName, setOrgName] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState(1); // 1: Verify token, 2: Set password

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tokenParam = params.get('token');
    if (tokenParam) {
      setToken(tokenParam);
      verifyToken(tokenParam);
    }
  }, [location]);

  const verifyToken = async (token: string) => {
    try {
      setLoading(true);
      const response = await fetch(
        `http://localhost:3000/auth/verify-invitation?token=${encodeURIComponent(token)}`
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Token verification failed');
      }

      const data = await response.json();

      if (data.valid) {
        setEmail(data.email);
        setOrgName(data.organization?.name || 'Your Organization');
        setStep(2);
      } else {
        setError(data.error || 'Invalid or expired token');
      }
    } catch (err) {
      console.error('Verification error:', err);
      if (err instanceof Error) {
        setError(err.message || 'Invalid token format');
      } else {
        setError('Invalid token format');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const response = await fetch('http://localhost:3000/auth/complete-invitation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password, name }),
      });

      if (response.ok) {
        await loginWithRedirect({
          appState: { returnTo: '/' },
          authorizationParams: {
            login_hint: email,
            prompt: 'login',
          },
        });
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Account creation failed');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return {
    step,
    email,
    orgName,
    password,
    name,
    loading,
    error,
    setPassword,
    setName,
    handleSubmit,
  };
}
