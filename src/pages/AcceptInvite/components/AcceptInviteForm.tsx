import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAcceptInvite } from '../hooks/useAcceptInvite';

export function AcceptInviteForm() {
  const {
    step,
    email,
    password,
    name,
    loading,
    error,
    setPassword,
    setName,
    handleSubmit,
  } = useAcceptInvite();

  return (
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
              <p className="text-xs text-gray-500">Must be at least 8 characters</p>
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
  );
}
