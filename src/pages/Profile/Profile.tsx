// Profile.tsx
import { useAuth0 } from '@auth0/auth0-react';
import { useEffect, useState } from 'react';
import { Button } from '../../components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Skeleton } from '../../components/ui/skeleton';
import { toast } from 'sonner';

export default function Profile() {
  const { user: auth0User, logout, getAccessTokenSilently } = useAuth0();
  const [profilePicture, setProfilePicture] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);


  useEffect(() => {
    // Profile.tsx
    const fetchProfilePicture = async () => {
      try {
        if (!auth0User?.sub) return;

        const token = await getAccessTokenSilently();
        const response = await fetch(
          `http://localhost:3000/auth/user/${encodeURIComponent(auth0User.sub)}/picture`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          }
        );

        if (!response.ok) {
          throw new Error('Failed to fetch profile picture');
        }

        const data = await response.json();

        // Ensure the URL is properly formatted
        let pictureUrl = data.pictureUrl;
        if (pictureUrl && !pictureUrl.startsWith('https://')) {
          pictureUrl = `https://${pictureUrl.replace(/^https?:\/\//, '')}`;
        }

        setProfilePicture(pictureUrl);
      } catch (error) {
        console.error('Error fetching profile picture:', error);
        setProfilePicture(null);
        toast.error('Failed to load profile picture', {
          description: error instanceof Error ? error.message : 'Unknown error',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfilePicture();
  }, [auth0User?.sub, getAccessTokenSilently, toast]);

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

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !auth0User?.sub) return;

    try {
      setIsLoading(true);
      const token = await getAccessTokenSilently();
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(
        `http://localhost:3000/auth/user/${auth0User.sub}/picture`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error('Failed to upload profile picture');
      }

      const data = await response.json();
      setProfilePicture(data.pictureUrl);
      toast.success('Profile picture updated successfully');
    } catch (error) {
      console.error('Error uploading profile picture:', error);
      toast.error('Failed to upload profile picture', {
        description: error instanceof Error ? error.message : 'Unknown error',
      });
    } finally {
      setIsLoading(false);
    }
  };


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
              {profilePicture ? (
                <img
                  src={profilePicture}
                  alt="Profile"
                  className="h-24 w-24 rounded-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                    setProfilePicture(null);
                    toast.error('Failed to load profile picture');
                  }}
                  crossOrigin="anonymous" // Add this for CORS
                />
              ) : (
                <div className="h-24 w-24 rounded-full bg-gray-200 flex items-center justify-center">
                  <span className="text-2xl text-gray-500">No Image</span>
                </div>
              )}
              <div>
                <h3 className="text-xl font-semibold">
                  {auth0User?.name || 'User'}
                </h3>
                <p className="text-gray-600">{auth0User?.email}</p>
              </div>
            </div>
            <div className="space-y-2">
              <p><span className="font-medium">Nickname:</span> {auth0User?.nickname || 'Not set'}</p>
            </div>
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
                onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })}
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