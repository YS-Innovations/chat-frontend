// Profile.tsx
import { useAuth0 } from '@auth0/auth0-react';
import { Button } from '../../components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Skeleton } from '../../components/ui/skeleton';
import { useProfilePicture } from './useProfilePicture'; // <-- import the hook
import { toast } from 'sonner';

export default function Profile() {
  const { user: auth0User, logout } = useAuth0();
  const {
    profilePicture,
    isLoading,
    uploadProfilePicture,
  } = useProfilePicture();

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      uploadProfilePicture(file);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto p-4">
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-[200px]" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-24 w-24 rounded-full" />
            <Skeleton className="h-6 w-[200px]" />
            <Skeleton className="h-6 w-[150px]" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Profile Information</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              {profilePicture || auth0User ? (
                <img
                  src={profilePicture || auth0User?.picture}
                  alt="Profile"
                  className="h-24 w-24 rounded-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                    toast.error('Failed to load profile picture');
                  }}
                  crossOrigin="anonymous"
                />
              ) : (
                <div className="h-24 w-24 rounded-full bg-gray-200 flex items-center justify-center">
                  <span className="text-2xl text-gray-500">No Image</span>
                </div>
              )}
              <div>
                <h3 className="text-xl font-semibold">{auth0User?.name || 'User'}</h3>
                <p className="text-gray-600">{auth0User?.email}</p>
              </div>
            </div>

            <p>
              <span className="font-medium">Nickname:</span>{' '}
              {auth0User?.nickname || 'Not set'}
            </p>

            <Button asChild variant="outline" className="relative">
              <label>
                Upload Picture
                <input
                  type="file"
                  className="absolute inset-0 opacity-0 cursor-pointer"
                  accept="image/*"
                  onChange={handleImageUpload}
                />
              </label>
            </Button>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() =>
                  logout({ logoutParams: { returnTo: window.location.origin } })
                }
              >
                Logout
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
