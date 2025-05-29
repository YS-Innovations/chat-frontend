import { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';

export default function AcceptInvitation() {
  const [searchParams] = useSearchParams();
  const [token, setToken] = useState(searchParams.get('token') || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [invitationData, setInvitationData] = useState<any>(null);
  const navigate = useNavigate();

  const verifyInvitation = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await fetch(`http://localhost:3000/auth/verify-invitation?token=${token}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to verify invitation');
      }

      if (data.valid) {
        setInvitationData(data);
      } else {
        setError(data.error || 'Invalid invitation token');
      }
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to verify invitation');
      }
    }
    finally {
      setLoading(false);
    }
  };

  const completeInvitation = async () => {
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    try {
      setLoading(true);
      setError('');
      const response = await fetch('http://localhost:3000/auth/complete-invitation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to complete invitation');
      }

      if (data.success) {
        navigate('/?message=invitation-complete');
      } else {
        setError('Failed to complete invitation');
      }
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to complete invitation');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center">Accept Invitation</CardTitle>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md text-sm">
              {error}
            </div>
          )}

          {!invitationData ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Invitation Token
                </label>
                <Input
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  placeholder="Enter your invitation token"
                />
              </div>
              <Button
                onClick={verifyInvitation}
                disabled={loading || !token.trim()}
                className="w-full"
              >
                {loading ? 'Verifying...' : 'Verify Invitation'}
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-gray-700 text-center mb-4">
                You've been invited to join as a member of the organization.
              </p>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <Input
                  value={invitationData.email}
                  disabled
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Set your password (min 8 characters)"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm Password
                </label>
                <Input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm your password"
                />
              </div>

              <Button
                onClick={completeInvitation}
                disabled={loading || !password || password !== confirmPassword || password.length < 8}
                className="w-full mt-4"
              >
                {loading ? 'Completing...' : 'Complete Registration'}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}