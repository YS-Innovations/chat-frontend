import { useEffect, useState, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuthShared } from '@/hooks/useAuthShared';

export function useAcceptInvite() {
  const { loginWithRedirect } = useAuthShared();
  const location = useLocation();

  const [token, setToken] = useState('');
  const [email, setEmail] = useState('');
  const [orgName, setOrgName] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState(1); // 1: Verify token, 2: Set password

  const hasVerifiedTokenRef = useRef<string | null>(null);
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tokenParam = params.get('token');
    if (tokenParam && tokenParam !== hasVerifiedTokenRef.current) {
      setToken(tokenParam);
      hasVerifiedTokenRef.current = tokenParam;
      verifyToken(tokenParam);
    }
  }, [location]);

  const verifyToken = async (token: string) => {
    try {
      setLoading(true);
      const response = await fetch(
        `${backendUrl}/auth/verify-invitation?token=${encodeURIComponent(token)}`
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
      const response = await fetch(`${backendUrl}/auth/complete-invitation`, {
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
