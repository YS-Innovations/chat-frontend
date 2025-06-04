// AcceptInvite.tsx
import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

function AcceptInvite() {
  const { loginWithRedirect } = useAuth0();
  const navigate = useNavigate();
  const [token, setToken] = useState('');
  const [email, setEmail] = useState('');
  const [orgName, setOrgName] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState(1); // 1: Verify token, 2: Set password

  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tokenParam = params.get('token');
    if (tokenParam) {
      setToken(tokenParam);
      verifyToken(tokenParam);
    }
  }, [location]);

// src/pages/AcceptInvite.tsx
async function verifyToken(token: string) {
  try {
    setLoading(true);
    // Pass the token as-is (still encrypted)
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
}
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:3000/auth/complete-invitation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({  token: token, password, name }),
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

  return (
<div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-100 to-white p-6">
  <Card className="w-full max-w-md rounded-xl shadow-xl border border-gray-200 bg-white">
    
    <CardContent className="pt-4">
      {error && (
        <Alert variant="destructive" className="mb-4 rounded-md">
          <AlertDescription className="text-sm text-red-600">{error}</AlertDescription>
        </Alert>
      )}

      {step === 1 ? (
        <div className="text-center py-8">
          {loading ? (
            <div className="flex flex-col items-center gap-4 text-gray-600">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              <p className="text-sm">Verifying your invitation...</p>
            </div>
          ) : (
            <p className="text-sm text-gray-500">Loading invitation details...</p>
          )}
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
        

          <div className="space-y-1">
            <Label className="text-sm text-gray-700">Email</Label>
            <Input
              type="email"
              value={email}
              readOnly
              className="bg-gray-100 text-gray-700 border border-gray-300"
            />
          </div>

          <div className="space-y-1">
            <Label className="text-sm text-gray-700">Full Name</Label>
            <Input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="John Doe"
              className="border border-gray-300 focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="space-y-1">
            <Label className="text-sm text-gray-700">Set Password</Label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              placeholder="••••••••"
              className="border border-gray-300 focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-500">
              Must be at least 8 characters
            </p>
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md transition"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating Account...
              </>
            ) : (
              'Create Account & Login'
            )}
          </Button>
        </form>
      )}
    </CardContent>
  </Card>
</div>

  );
}

export default AcceptInvite;